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

export class MediaRecorderManager {
	private readonly _listener: () => void;
	private _options: MediaRecorderManagerOptions | undefined;
	private _promise: Promise<MediaStream | string> | undefined;
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

	private _handleSuccessLaunch = (stream: MediaStream): MediaStream => {
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
		return stream;
	};

	private _handleErrorLaunch = (err: string) => {
		console.error('Trying launch media recorder the following error occurred: ' + err);
		this._listener();
		return err;
	};

	public init = (constraints?: MediaStreamConstraints): Promise<MediaStream | string> => {
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
