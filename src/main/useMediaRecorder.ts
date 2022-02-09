import {useEffect, useRef, useState} from "react";

export interface IMediaRecorder {
    options?: {
        constraints?: MediaStreamConstraints
        mediaRecorderOptions: MediaRecorderOptions
    }
}

export interface IMediaRecorderResponse {
    blob: Blob | undefined;
    onStart: () => void;
    onStop: () => void;
    recorded: boolean;
    available: boolean;
}

const DEFAULT_MEDIA_CONSTRAINTS = {
    audio: true,
    video: true
};

export const useMediaRecorder = ({options}: IMediaRecorder): IMediaRecorderResponse => {
    const [recorded, setRecorded] = useState(false);
    const [available, setAvailable] = useState(false);
    const [blob, setBlob] = useState<Blob>();
    const chunks = useRef<BlobPart[]>([]);
    const mediaRecorder = useRef<MediaRecorder>();

    useEffect(() => {
        navigator.mediaDevices.getUserMedia(options?.constraints || DEFAULT_MEDIA_CONSTRAINTS)
            .then(handleSuccessLaunch, handleErrorLaunch)
    }, [])

    const handleSuccessLaunch = (stream: MediaStream): void => {
        mediaRecorder.current = new MediaRecorder(stream);

        setAvailable(true)

        mediaRecorder.current.ondataavailable = (event: BlobEvent): void => {
            chunks.current.push(event.data)
        }

        mediaRecorder.current.onstart = () => {
            setBlob(new Blob([], {'type': 'video/mp4'}))
            setRecorded(true)
        }

        mediaRecorder.current.onpause = () => {
        }

        mediaRecorder.current.onresume = () => {
        }

        mediaRecorder.current.onstop = (): void => {
            setBlob(new Blob(chunks.current, {'type': 'video/mp4'}));
            chunks.current = []
            setRecorded(false)
        }
    }

    const handleErrorLaunch = (err: string): void => {
        console.error('Trying launch media recorder the following error occurred: ' + err);
    }

    const handleStart = (): void => {
        mediaRecorder.current?.start();
    }

    const handleStop = (): void => {
        mediaRecorder.current?.stop();
    }

    return {
        blob,
        onStart: handleStart,
        onStop: handleStop,
        available,
        recorded
    }
}
