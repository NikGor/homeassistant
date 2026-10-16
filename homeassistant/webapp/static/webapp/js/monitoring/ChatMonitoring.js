// Chat monitoring (ARCHIE-213): an LLM judge grades assistant turns red/orange/green.
// Data: Django /chat-monitoring/api/. A run is started on the agent; the agent
// reports each judged turn to Django, the UI polls the run state.
// Protocol: archie_shared.monitoring.models (MonitorRunInfo, MonitorTurnEvaluation).

const CM_API = '/chat-monitoring/api';
const CM_POLL_MS = 2000;
const CM_GRADES = ['red', 'orange', 'green'];
const CM_GRADE_LABELS = { red: 'Плохо', orange: 'Есть замечания', green: 'Хорошо' };
const CM_CRITERIA_LABELS = {
    helpfulness: 'Полезность',
    correctness: 'Корректность',
    tool_choice: 'Инструменты',
    skill_usage: 'Скиллы',
    format_fit: 'Формат',
};
const CM_RUN_SIZES = [10, 20, 50, 100, 200];
const CM_TEXT_PREVIEW = 600;

const cmState = {
    active: false,
    summary: null,
    conversations: [],
    hasMore: false,
    page: 1,
    filter: { grade: '', unreviewed: false },
    open: new Map(),      // conversation_id -> detail (null while loading)
    expandedText: new Set(),
    run: null,
    runSize: 20,
    pollTimer: null,
    error: null,
};

// --- Helpers (shared formatting lives in PromptEvals.js: peEscape, peFormatDate, pePlural) ---

async function cmFetch(path, options = {}) {
    const response = await fetch(`${CM_API}${path}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken'), ...(options.headers || {}) },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    return data;
}

function cmSetError(error) {
    cmState.error = error ? String(error.message || error) : null;
    cmRender();
}

function cmGradeDot(grade) {
    return grade
        ? `<span class="cm-dot cm-dot--${grade}" title="${CM_GRADE_LABELS[grade]}"></span>`
        : '<span class="cm-dot cm-dot--na" title="Не применимо"></span>';
}

const CM_TURN_FORMS = ['реплика', 'реплики', 'реплик'];
const CM_CONVERSATION_FORMS = ['беседа', 'беседы', 'бесед'];

// --- Data ---

async function cmLoadSummary() {
    cmState.summary = await cmFetch('/summary/');
}

async function cmLoadConversations(reset = true) {
    if (reset) cmState.page = 1;
    const params = new URLSearchParams({ page: cmState.page });
    if (cmState.filter.grade) params.set('grade', cmState.filter.grade);
    if (cmState.filter.unreviewed) params.set('unreviewed', '1');
    const data = await cmFetch(`/conversations/?${params}`);
    cmState.conversations = reset ? data.conversations : cmState.conversations.concat(data.conversations);
    cmState.hasMore = data.has_more;
}

async function cmRefresh() {
    try {
        await Promise.all([cmLoadSummary(), cmLoadConversations()]);
        cmState.error = null;
    } catch (error) {
        cmState.error = error.message;
    }
    cmRender();
}

async function cmToggleConversation(conversationId) {
    if (cmState.open.has(conversationId)) {
        cmState.open.delete(conversationId);
        cmRender();
        return;
    }
    cmState.open.set(conversationId, null);
    cmRender();
    try {
        cmState.open.set(conversationId, await cmFetch(`/conversations/${encodeURIComponent(conversationId)}/`));
    } catch (error) {
        cmState.open.delete(conversationId);
        cmState.error = error.message;
    }
    cmRender();
}

async function cmMarkReviewed(conversationId) {
    try {
        await cmFetch(`/conversations/${encodeURIComponent(conversationId)}/review/`, { method: 'POST' });
        cmState.open.delete(conversationId);
        await cmRefresh();
    } catch (error) {
        cmSetError(error);
    }
}

// --- Runs ---

async function cmStartRun() {
    try {
        cmState.run = await cmFetch('/runs/start/', {
            method: 'POST',
            body: JSON.stringify({ max_conversations: cmState.runSize }),
        });
        cmState.error = null;
        cmRender();
        cmPollRun();
    } catch (error) {
        cmSetError(error);
    }
}

function cmPollRun() {
    clearTimeout(cmState.pollTimer);
    cmState.pollTimer = setTimeout(async () => {
        if (!cmState.active || !cmState.run) return;
        try {
            cmState.run = await cmFetch(`/runs/${cmState.run.run_id}/`);
        } catch (error) {
            // The first run update may not be stored yet; keep polling
            console.warn('[Monitoring] run poll failed', error);
        }
        if (cmState.run.status === 'running') {
            cmRender();
            cmPollRun();
            return;
        }
        await cmRefresh();
    }, CM_POLL_MS);
}

async function cmAttachActiveRun() {
    // No active run: show the last one (it may have finished while the view was hidden)
    const { run } = await cmFetch('/runs/active/');
    cmState.run = run || (cmState.summary && cmState.summary.runs[0]) || null;
    cmRender();
    if (run) cmPollRun();
}

// --- Rendering ---

function cmRenderHeader() {
    return `
        <div class="pe__header">
            <div class="pe__title"><i data-lucide="shield-check" class="w-5 h-5"></i> Мониторинг чатов</div>
            <div class="pe-muted">LLM-судья оценивает ответы Archie: полезность, корректность, инструменты, скиллы, формат.</div>
        </div>`;
}

function cmRenderSummary() {
    const summary = cmState.summary;
    if (!summary) return '';
    const tiles = CM_GRADES.map(grade => `
        <button class="cm-stat cm-stat--${grade} ${cmState.filter.grade === grade ? 'cm-stat--on' : ''}" data-cm-grade="${grade}">
            <span class="cm-stat__value">${summary.conversations[grade] || 0}</span>
            <span class="cm-stat__label">${cmGradeDot(grade)} ${CM_GRADE_LABELS[grade]}</span>
            <span class="pe-muted">${pePlural(summary.turns[grade] || 0, CM_TURN_FORMS)}</span>
        </button>`).join('');
    return `<div class="cm-stats">${tiles}${cmRenderRunBox()}</div>`;
}

function cmRenderRunBox() {
    const run = cmState.run;
    if (run && run.status === 'running') {
        const percent = run.total_turns ? Math.round((run.done_turns / run.total_turns) * 100) : 0;
        return `
            <div class="cm-run">
                <div class="cm-run__title"><span class="pe-badge pe-badge--live">идёт оценка</span>
                    ${run.done_turns} / ${pePlural(run.total_turns, CM_TURN_FORMS)}</div>
                <div class="cm-progress"><div class="cm-progress__bar" style="width:${percent}%"></div></div>
                <div class="pe-muted">${cmGradeDot('red')} ${run.red} ${cmGradeDot('orange')} ${run.orange} ${cmGradeDot('green')} ${run.green}
                    ${run.errors ? ` · ошибок: ${run.errors}` : ''} · $${(run.total_cost || 0).toFixed(4)} · ${peEscape(run.judge_model)}</div>
            </div>`;
    }
    const summary = cmState.summary;
    const options = CM_RUN_SIZES.map(size =>
        `<option value="${size}" ${size === cmState.runSize ? 'selected' : ''}>${size}</option>`).join('');
    const last = run && run.status !== 'running'
        ? `<div class="pe-muted">Последний прогон: ${peFormatDate(run.finished_at || run.created_at)} · ${run.done_turns} оценено
            ${run.errors ? `· ошибок: ${run.errors}` : ''} · $${(run.total_cost || 0).toFixed(4)}${run.error ? ` · ${peEscape(run.error)}` : ''}</div>`
        : '';
    return `
        <div class="cm-run">
            <div class="cm-run__title">Не оценено: ${pePlural(summary.pending_turns, CM_TURN_FORMS)}
                · ${pePlural(summary.pending_conversations, CM_CONVERSATION_FORMS)}</div>
            <div class="cm-run__actions">
                <label class="pe-muted">до <select id="cm-run-size" class="cm-select">${options}</select> бесед</label>
                <button class="pe-btn" id="cm-run-start" ${summary.pending_turns ? '' : 'disabled'}>
                    <i data-lucide="play" class="w-4 h-4"></i> Оценить</button>
            </div>
            ${last}
        </div>`;
}

function cmRenderFilters() {
    const chips = [['', 'Все'], ...CM_GRADES.map(grade => [grade, CM_GRADE_LABELS[grade]])].map(([grade, label]) =>
        `<button class="pe-chip pe-chip--btn ${cmState.filter.grade === grade ? 'pe-chip--on' : ''}" data-cm-grade="${grade}">${label}</button>`).join('');
    return `
        <div class="cm-filters">
            ${chips}
            <label class="cm-check"><input type="checkbox" id="cm-unreviewed" ${cmState.filter.unreviewed ? 'checked' : ''}> только непросмотренные</label>
        </div>`;
}

function cmRenderToolCalls(evaluation) {
    if (!evaluation.trace_found) return '<span class="pe-muted">трейс Langfuse не найден — инструменты не оценивались</span>';
    if (!evaluation.tool_calls.length) return '<span class="pe-muted">инструменты не вызывались</span>';
    return evaluation.tool_calls.map(call => {
        const mark = call.success === false ? ' ✗' : call.success === true ? ' ✓' : '';
        return `<span class="pe-chip ${call.success === false ? 'cm-chip--failed' : ''}" title="${peEscape(call.arguments)}">${peEscape(call.name)}${mark}</span>`;
    }).join(' ');
}

function cmRenderEvaluation(evaluation) {
    const criteria = evaluation.criteria.map(item => `
        <div class="cm-criterion">
            ${cmGradeDot(item.grade)}
            <span class="cm-criterion__name">${CM_CRITERIA_LABELS[item.criterion] || peEscape(item.criterion)}</span>
            <span class="cm-criterion__comment">${peEscape(item.comment)}</span>
        </div>`).join('');
    const skills = evaluation.skills_loaded.length
        ? `<div class="cm-eval__row"><span class="pe-muted">Скиллы:</span> ${evaluation.skills_loaded.map(name => `<span class="pe-chip">${peEscape(name)}</span>`).join(' ')}</div>`
        : '';
    const cost = evaluation.judge_cost != null ? ` · $${evaluation.judge_cost.toFixed(5)}` : '';
    return `
        <div class="cm-eval cm-eval--${evaluation.grade}">
            <div class="cm-eval__summary">${cmGradeDot(evaluation.grade)} ${peEscape(evaluation.summary)}</div>
            ${criteria ? `<div class="cm-criteria">${criteria}</div>` : ''}
            <div class="cm-eval__row"><span class="pe-muted">Инструменты:</span> ${cmRenderToolCalls(evaluation)}</div>
            ${skills}
            <div class="pe-muted">${peEscape(evaluation.judge_model)} · ${peFormatDate(evaluation.evaluated_at)}${cost}
                ${evaluation.reviewed_at ? ` · просмотрено ${peEscape(evaluation.reviewed_by)}` : ''}</div>
        </div>`;
}

function cmRenderMessage(message) {
    const text = message.text || `[${message.content_format}]`;
    const expanded = cmState.expandedText.has(message.message_id);
    const shown = expanded || text.length <= CM_TEXT_PREVIEW ? text : `${text.slice(0, CM_TEXT_PREVIEW)}…`;
    const more = text.length > CM_TEXT_PREVIEW
        ? `<button class="cm-link" data-cm-text="${peEscape(message.message_id)}">${expanded ? 'свернуть' : 'показать полностью'}</button>`
        : '';
    const role = message.role === 'user' ? 'Пользователь' : `Archie · ${peEscape(message.content_format)}`;
    return `
        <div class="cm-msg cm-msg--${message.role}">
            <div class="cm-msg__meta">${role} · ${peFormatDate(message.created_at)}</div>
            <div class="cm-msg__text">${peEscape(shown)}</div>${more}
            ${message.evaluation ? cmRenderEvaluation(message.evaluation) : (message.role === 'assistant' ? '<div class="pe-muted">не оценено</div>' : '')}
        </div>`;
}

function cmRenderConversation(conversation) {
    const isOpen = cmState.open.has(conversation.conversation_id);
    const detail = cmState.open.get(conversation.conversation_id);
    const counts = CM_GRADES.filter(grade => conversation[grade])
        .map(grade => `<span class="cm-count cm-count--${grade}">${conversation[grade]}</span>`).join('');
    let body = '';
    if (isOpen) {
        body = detail
            ? `<div class="cm-thread">${detail.messages.map(cmRenderMessage).join('')}
                ${conversation.unreviewed ? `<button class="pe-btn pe-btn--small" data-cm-review="${peEscape(conversation.conversation_id)}">
                    <i data-lucide="check" class="w-4 h-4"></i> Отметить просмотренным</button>` : ''}</div>`
            : '<div class="pe-muted cm-thread">Загрузка…</div>';
    }
    return `
        <div class="pe-prompt cm-conv cm-conv--${conversation.grade}">
            <button class="pe-prompt__head" data-cm-open="${peEscape(conversation.conversation_id)}">
                ${cmGradeDot(conversation.grade)}
                <span class="pe-prompt__title">
                    <span class="cm-conv__title">${peEscape(conversation.title)}</span>
                    <span class="pe-prompt__desc">${peFormatDate(conversation.created_at)} · оценено ${peFormatDate(conversation.last_evaluated_at)}</span>
                </span>
                <span class="pe-prompt__counts">${counts}
                    ${conversation.unreviewed ? '<span class="pe-badge pe-badge--warn">новое</span>' : ''}</span>
                <i data-lucide="${isOpen ? 'chevron-up' : 'chevron-down'}" class="w-4 h-4"></i>
            </button>
            ${body}
        </div>`;
}

function cmRenderList() {
    if (!cmState.conversations.length) {
        return '<div class="pe-empty">Нет оценённых бесед под этот фильтр. Запустите оценку, чтобы судья прошёл по новым беседам.</div>';
    }
    return `
        <div class="pe-overview">${cmState.conversations.map(cmRenderConversation).join('')}</div>
        ${cmState.hasMore ? '<button class="pe-btn pe-btn--ghost" id="cm-more">Показать ещё</button>' : ''}`;
}

function cmRender() {
    const root = document.getElementById('monitoring-root');
    if (!root || !cmState.active) return;
    const error = cmState.error
        ? `<div class="pe-warning"><i data-lucide="alert-triangle" class="w-4 h-4"></i> ${peEscape(cmState.error)}</div>`
        : '';
    root.innerHTML = `
        ${cmRenderHeader()}
        <div class="pe__body">
            ${error}
            ${cmRenderSummary()}
            ${cmRenderFilters()}
            ${cmRenderList()}
        </div>`;
    lucide.createIcons({ nodes: [root] });
}

// --- Events (delegated, bound once) ---

function cmHandleClick(event) {
    const target = event.target.closest('button, [data-cm-grade]');
    if (!target) return;
    if (target.id === 'cm-run-start') cmStartRun();
    else if (target.id === 'cm-more') {
        cmState.page += 1;
        cmLoadConversations(false).then(cmRender).catch(cmSetError);
    } else if (target.dataset.cmGrade !== undefined) {
        const grade = target.dataset.cmGrade;
        cmState.filter.grade = cmState.filter.grade === grade ? '' : grade;
        cmLoadConversations().then(cmRender).catch(cmSetError);
    } else if (target.dataset.cmOpen) cmToggleConversation(target.dataset.cmOpen);
    else if (target.dataset.cmReview) cmMarkReviewed(target.dataset.cmReview);
    else if (target.dataset.cmText) {
        const id = target.dataset.cmText;
        if (cmState.expandedText.has(id)) cmState.expandedText.delete(id);
        else cmState.expandedText.add(id);
        cmRender();
    }
}

function cmHandleChange(event) {
    if (event.target.id === 'cm-unreviewed') {
        cmState.filter.unreviewed = event.target.checked;
        cmLoadConversations().then(cmRender).catch(cmSetError);
    } else if (event.target.id === 'cm-run-size') {
        cmState.runSize = Number(event.target.value);
    }
}

function initChatMonitoring() {
    const root = document.getElementById('monitoring-root');
    if (!root) return;
    root.addEventListener('click', cmHandleClick);
    root.addEventListener('change', cmHandleChange);
}

// --- View switching (same pattern as showPromptsView) ---

function showMonitoringView() {
    ['chat-view', 'dashboard-view', 'widget-view', 'voice-view'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    if (typeof window.hideSwarmView === 'function') window.hideSwarmView();
    if (typeof window.hidePromptsView === 'function') window.hidePromptsView();
    document.getElementById('monitoring-view').classList.remove('hidden');
    document.body.classList.remove('voice-mode');
    if (typeof window.stopVoiceSession === 'function') window.stopVoiceSession();
    if (typeof stopDashboardPolling === 'function') stopDashboardPolling();
    document.getElementById('left-sidebar').classList.add('hidden');
    updateSidebarActiveState('monitoring');
    cmState.active = true;
    cmRender();
    cmRefresh().then(() => cmAttachActiveRun()).catch(cmSetError);
}

function hideMonitoringView() {
    const view = document.getElementById('monitoring-view');
    if (view) view.classList.add('hidden');
    cmState.active = false;
    clearTimeout(cmState.pollTimer);
}

window.showMonitoringView = showMonitoringView;
window.hideMonitoringView = hideMonitoringView;

document.addEventListener('DOMContentLoaded', initChatMonitoring);
