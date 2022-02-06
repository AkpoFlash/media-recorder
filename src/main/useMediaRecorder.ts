import {useState} from "react";

export interface IMediaRecorder {
    options?: {
        constraints?: MediaStreamConstraints
        mediaRecorderOptions: MediaRecorderOptions
    }
}

export interface IMediaRecorderResponse {
    blob: Blob;
    onStart: () => void;
    onStop: () => void;
    isRecorded: boolean;
}

const DEFAULT_MEDIA_CONSTRAINTS = {
    audio: true,
    video: true
};

export const useMediaRecorder = (props: IMediaRecorder): IMediaRecorderResponse => {
    const [isRecorded, setIsRecorded] = useState(false);
    const [chunks, setChunks] = useState<BlobPart[]>([]);
    const [blob, setBlob] = useState(new Blob());
    let mediaRecorder: MediaRecorder;

    const handleSuccessLaunch = (stream: MediaStream): void => {
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event: BlobEvent): void => {
            chunks.push(event.data);
        }

        mediaRecorder.onstop = (): void => {
            setBlob(new Blob(chunks, {'type': 'video/mp4'}));
            setChunks([]);
        }
    }

    const handleErrorLaunch = (err: string): void => {
        console.error('Trying launch media recorder the following error occurred: ' + err);
    }

    const handleStart = (): void => {
        mediaRecorder.start();
        setIsRecorded(true)
    }

    const handleStop = (): void => {
        mediaRecorder.stop();
        setIsRecorded(false)
    }

    navigator.mediaDevices.getUserMedia(props.options?.constraints || DEFAULT_MEDIA_CONSTRAINTS)
        .then(handleSuccessLaunch, handleErrorLaunch)

    return {
        blob,
        onStart: handleStart,
        onStop: handleStop,
        isRecorded
    }
}
