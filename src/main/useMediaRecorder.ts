import {useEffect, useRef, useState, MutableRefObject} from "react";

export interface IMediaRecorder {
    videoRef?: MutableRefObject<HTMLVideoElement>;
    options?: {
        mediaRecorderOptions?: MediaRecorderOptions
        blobOptions?: BlobPropertyBag
        constraints?: MediaStreamConstraints
    }
}

export interface IMediaRecorderResponse {
    blob: Blob | undefined;
    onStart: () => void;
    onStop: () => void;
    onPause: () => void;
    onResume: () => void;
    recorded: boolean;
    paused: boolean;
    available: boolean;
}

const DEFAULT_MEDIA_CONSTRAINTS = {
    audio: true,
    video: true
};

const DEFAULT_MEDIA_RECORDER_OPTIONS = {
    audioBitsPerSecond: 128000,
    videoBitsPerSecond: 2500000,
    mimeType: 'video/webm'
};

const DEFAULT_BLOG_OPTIONS = {
    type: 'video/webm'
};

export const useMediaRecorder = (props?: IMediaRecorder): IMediaRecorderResponse => {
    const {
        mediaRecorderOptions = DEFAULT_MEDIA_RECORDER_OPTIONS,
        blobOptions = DEFAULT_BLOG_OPTIONS,
        constraints = DEFAULT_MEDIA_CONSTRAINTS
    } = props?.options || {}
    const [recorded, setRecorded] = useState(false);
    const [paused, setPaused] = useState(false);
    const [available, setAvailable] = useState(false);
    const [blob, setBlob] = useState<Blob>();
    const chunks = useRef<BlobPart[]>([]);
    const mediaRecorder = useRef<MediaRecorder>();

    useEffect(() => {
        navigator.mediaDevices.getUserMedia(constraints)
            .then(handleSuccessLaunch, handleErrorLaunch)
    }, [])

    const handleSuccessLaunch = (stream: MediaStream): void => {
        setAvailable(true)

        if(props?.videoRef){
            props.videoRef.current.srcObject = stream
        }

        mediaRecorder.current = new MediaRecorder(stream, mediaRecorderOptions);

        mediaRecorder.current.ondataavailable = (event: BlobEvent): void => {
            chunks.current.push(event.data)
        }

        mediaRecorder.current.onstart = () => {
            setBlob(new Blob([], blobOptions))
            setRecorded(true)
        }

        mediaRecorder.current.onpause = () => {
            setPaused(true)
        }

        mediaRecorder.current.onresume = () => {
            setPaused(false)
        }

        mediaRecorder.current.onstop = (): void => {
            setBlob(new Blob(chunks.current, blobOptions));
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

    const handlePause = (): void => {
        mediaRecorder.current?.pause();
    }

    const handleResume = (): void => {
        mediaRecorder.current?.resume();
    }

    return {
        blob,
        onStart: handleStart,
        onStop: handleStop,
        onPause: handlePause,
        onResume: handleResume,
        available,
        recorded,
        paused
    }
}
