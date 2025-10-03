# Archie Shared

Shared Pydantic models and utilities for the Archie ecosystem.

## Overview

This package contains common data models and utilities used across different Archie services:

- Chat models for AI assistant communication
- UI models for rich interface components
- Shared utilities and helpers

## Usage

### For external repositories (from GitHub):

Add to your `pyproject.toml`:

```toml
[tool.poetry.dependencies]
archie-shared = {git = "https://github.com/NikGor/homeassistant.git", subdirectory = "archie-shared"}
```

Or for a specific branch/tag:

```toml
[tool.poetry.dependencies]
archie-shared = {git = "https://github.com/NikGor/homeassistant.git", rev = "main", subdirectory = "archie-shared"}
```

Then run:

```bash
poetry install
```

Alternatively, you can add it via command line:

```bash
poetry add git+https://github.com/NikGor/homeassistant.git#subdirectory=archie-shared
```

### For local development in this repository:

```bash
poetry add archie-shared --path ./archie-shared
```

Then import the models you need:

```python
from archie_shared.chat.models import ChatMessage, ConversationModel
from archie_shared.ui.models import UIElements, Card
```
