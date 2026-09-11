"""Entry point for the Archie wake-word voice assistant.

python main.py                # run the assistant
python main.py --list-devices # list input devices and exit
python main.py --test-mic     # record 2s from the selected mic and exit
"""

import argparse

from archie_voice import audio, config
from archie_voice.session import run


def cli():
    parser = argparse.ArgumentParser(description="Archie wake-word voice assistant")
    parser.add_argument("--list-devices", action="store_true")
    parser.add_argument("--test-mic", action="store_true")
    args = parser.parse_args()

    if args.list_devices:
        audio.print_input_devices(selected=config.MIC_DEVICE)
        return
    if args.test_mic:
        audio.print_input_devices(selected=config.MIC_DEVICE)
        audio.test_microphone(config.MIC_DEVICE)
        return

    run()


if __name__ == "__main__":
    cli()
