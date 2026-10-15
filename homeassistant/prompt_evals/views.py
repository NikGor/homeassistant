import json
import logging
import os

from archie_shared.evals.models import EvalCaseResult as EvalCaseResultModel
from archie_shared.evals.models import (EvalRunInfo, EvalRunRequest,
                                        EvalSnapshotEvent)
from django.contrib.auth.decorators import login_required
from django.http import HttpRequest, JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST
from pydantic import TypeAdapter, ValidationError

from homeassistant.prompt_evals import services
from homeassistant.prompt_evals.models import EvalCaseResult, EvalRun

logger = logging.getLogger(__name__)

EVAL_PUBLISH_TOKEN = os.getenv("EVAL_PUBLISH_TOKEN", "")
RUN_LIST_LIMIT = 100

_run_update_adapter: TypeAdapter[EvalSnapshotEvent | EvalRunInfo] = TypeAdapter(
    EvalSnapshotEvent | EvalRunInfo
)


def is_agent_request(request: HttpRequest) -> bool:
    expected = f"Bearer {EVAL_PUBLISH_TOKEN}"
    return bool(EVAL_PUBLISH_TOKEN) and request.headers.get("Authorization") == expected


def agent_error_response(error: services.AgentError) -> JsonResponse:
    logger.error(f"prompt_evals_error_001: \033[31m{error}\033[0m")
    return JsonResponse({"error": str(error)}, status=error.status_code)


@csrf_exempt
@require_POST
def ingest_run(request: HttpRequest) -> JsonResponse:
    """Agent -> Django: run snapshot at start, EvalRunInfo at the end."""
    if not is_agent_request(request):
        return JsonResponse({"error": "Forbidden"}, status=403)
    try:
        update = _run_update_adapter.validate_json(request.body)
    except ValidationError as error:
        logger.error(f"prompt_evals_error_002: Bad run update: \033[31m{error}\033[0m")
        return JsonResponse({"error": str(error)}, status=422)
    run = services.store_run(update)
    return JsonResponse({"run_id": run.run_id})


@csrf_exempt
@require_POST
def ingest_result(request: HttpRequest, run_id: str) -> JsonResponse:
    """Agent -> Django: one finished attempt."""
    if not is_agent_request(request):
        return JsonResponse({"error": "Forbidden"}, status=403)
    run = get_object_or_404(EvalRun, run_id=run_id)
    try:
        result = EvalCaseResultModel.model_validate_json(request.body)
    except ValidationError as error:
        logger.error(f"prompt_evals_error_003: Bad result: \033[31m{error}\033[0m")
        return JsonResponse({"error": str(error)}, status=422)
    stored = services.store_result(run, result)
    return JsonResponse({"id": stored.id})


@login_required
@require_GET
def get_catalog(request: HttpRequest) -> JsonResponse:
    try:
        catalog = services.get_agent_catalog()
    except services.AgentError as error:
        return agent_error_response(error)
    return JsonResponse(catalog.model_dump(mode="json"))


@login_required
@require_GET
def get_overview(request: HttpRequest) -> JsonResponse:
    try:
        catalog = services.get_agent_catalog()
    except services.AgentError as error:
        return agent_error_response(error)
    return JsonResponse({"prompts": services.build_overview(catalog)})


@login_required
@require_GET
def list_runs(request: HttpRequest) -> JsonResponse:
    runs = services.list_runs(
        model=request.GET.get("model"),
        prompt=request.GET.get("prompt"),
        case_id=request.GET.get("case_id"),
        limit=int(request.GET.get("limit", RUN_LIST_LIMIT)),
    )
    return JsonResponse({"runs": runs})


@login_required
@require_GET
def get_run(request: HttpRequest, run_id: str) -> JsonResponse:
    run = get_object_or_404(EvalRun, run_id=run_id)
    return JsonResponse(services.get_run_detail(run))


@login_required
@require_GET
def get_result_output(request: HttpRequest, result_id: int) -> JsonResponse:
    result = get_object_or_404(EvalCaseResult, id=result_id)
    output = json.loads(result.output_json) if result.output_json else None
    return JsonResponse({"output": output})


@login_required
@require_POST
def start_run(request: HttpRequest) -> JsonResponse:
    """UI -> agent: start a run; the agent then reports progress to this app."""
    try:
        run_request = EvalRunRequest.model_validate(
            {**json.loads(request.body), "triggered_by": "ui"}
        )
    except (ValidationError, json.JSONDecodeError) as error:
        return JsonResponse({"error": str(error)}, status=422)
    try:
        run = services.start_agent_run(run_request)
    except services.AgentError as error:
        return agent_error_response(error)
    logger.info(f"prompt_evals_002: Run \033[34m{run['run_id']}\033[0m started from UI")
    return JsonResponse(run, status=202)


@login_required
@require_POST
def cancel_run(request: HttpRequest, run_id: str) -> JsonResponse:
    try:
        return JsonResponse(services.cancel_agent_run(run_id))
    except services.AgentError as error:
        return agent_error_response(error)


@login_required
@require_GET
def get_active_run(request: HttpRequest) -> JsonResponse:
    """The run in progress, if any, so the UI can reattach after a reload."""
    try:
        runs = services.call_agent("GET", "/evals/runs")
    except services.AgentError as error:
        return agent_error_response(error)
    active = next(
        (run for run in runs if run["status"] in ("queued", "running")),
        None,
    )
    return JsonResponse({"run": active})
