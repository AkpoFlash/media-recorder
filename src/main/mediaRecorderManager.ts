const DEFAULT_MEDIA_CONSTRAINTS = {
	audio: true,
	video: true,
};

const DEFAULT_MEDIA_RECORDER_OPTIONS = {
	audioBitsPerSecond: 128000,
	videoBitsPerSecond: 2500000,
	mimeType: 'video/webm',
};

const DEFAULT_BLOG_OPTIONS = {
	type: 'video/webm',
};

interface MediaRecorderManagerOptions {
	mediaRecorderOptions?: MediaRecorderOptions;
	blobOptions?: BlobPropertyBag;
	constraints?: MediaStreamConstraints;
}

export interface MediaRecorderResponse {
	data: MediaStream | undefined;
	error: string | undefined;
}

export class MediaRecorderManager {
	private readonly _listener: () => void;
	private _options: MediaRecorderManagerOptions | undefined;
	private _promise: Promise<MediaRecorderResponse> | undefined;
	private _mediaRecorder: MediaRecorder | undefined;
	private _chunks: BlobPart[] = [];

	public available = false;
	public recorded = false;
	public paused = false;
	public stream: MediaStream | undefined;
	public blob: Blob | undefined;

	constructor(listener: () => void, options?: MediaRecorderManagerOptions) {
		this._listener = listener;
		this._options = options;
	}

	private _handleSuccessLaunch = (stream: MediaStream): MediaRecorderResponse => {
		this.available = true;

		this.stream = stream;
		this._mediaRecorder = new MediaRecorder(
			this.stream,
			this._options?.mediaRecorderOptions || DEFAULT_MEDIA_RECORDER_OPTIONS
		);

		this._mediaRecorder.addEventListener('dataavailable', (event: BlobEvent) => {
			this._chunks.push(event.data);
			this._listener();
		});

		this._mediaRecorder.addEventListener('start', () => {
			this.recorded = true;
			this.blob = new Blob([], this._options?.blobOptions || DEFAULT_BLOG_OPTIONS);
			this._listener();
		});

		this._mediaRecorder.addEventListener('stop', () => {
			this.recorded = false;
			this.blob = new Blob(this._chunks, this._options?.blobOptions || DEFAULT_BLOG_OPTIONS);
			this._chunks = [];
			this._listener();
		});

		this._mediaRecorder.addEventListener('pause', () => {
			this.paused = true;
			this._listener();
		});

		this._mediaRecorder.addEventListener('resume', () => {
			this.paused = false;
			this._listener();
		});

		this._listener();
		return { data: stream, error: undefined };
	};

	private _handleErrorLaunch = (error: string): MediaRecorderResponse => {
		this._listener();
		return { data: undefined, error };
	};

	public init = (constraints?: MediaStreamConstraints): Promise<MediaRecorderResponse> => {
		return (this._promise ||= navigator.mediaDevices
			.getUserMedia(constraints || DEFAULT_MEDIA_CONSTRAINTS)
			.then(this._handleSuccessLaunch, this._handleErrorLaunch));
	};

	public start = (): void => {
		this._mediaRecorder?.start();
	};

	public stop = (): void => {
		this._mediaRecorder?.stop();
	};

	public pause = (): void => {
		this._mediaRecorder?.pause();
	};

	public resume = (): void => {
		this._mediaRecorder?.resume();
	};
}
