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
	private readonly _listener: Function;
	private _options: MediaRecorderManagerOptions | undefined;
	private _promise: Promise<MediaStream | void> | undefined;
	private _mediaRecorder: MediaRecorder | undefined;
	private _chunks: BlobPart[] = [];

	public available = false;
	public recorded = false;
	public paused = false;
	public stream: MediaStream | undefined;
	public blob: Blob | undefined;

	constructor(listener: Function, options?: MediaRecorderManagerOptions) {
		this._listener = listener;
		this._options = options;
	}

	private _handleSuccessLaunch = (stream: MediaStream): void => {
		this.available = true;

		this.stream = stream;
		this._mediaRecorder = new MediaRecorder(
			this.stream,
			this._options?.mediaRecorderOptions || DEFAULT_MEDIA_RECORDER_OPTIONS
		);

		this._mediaRecorder.addEventListener('dataavailable', (event: BlobEvent): void => {
			this._chunks.push(event.data);
			this._listener();
		});

		this._mediaRecorder.addEventListener('start', (): void => {
			this.recorded = true;
			this.blob = new Blob([], this._options?.blobOptions || DEFAULT_BLOG_OPTIONS);
			this._listener();
		});

		this._mediaRecorder.addEventListener('stop', (): void => {
			this.recorded = false;
			this.blob = new Blob(this._chunks, this._options?.blobOptions || DEFAULT_BLOG_OPTIONS);
			this._chunks = [];
			this._listener();
		});

		this._mediaRecorder.addEventListener('pause', (): void => {
			this.paused = true;
			this._listener();
		});

		this._mediaRecorder.addEventListener('resume', (): void => {
			this.paused = false;
			this._listener();
		});

		this._listener();
	};

	private _handleErrorLaunch = (err: string): void => {
		console.error('Trying launch media recorder the following error occurred: ' + err);
		this._listener();
	};

	public init = (constraints?: MediaStreamConstraints): Promise<MediaStream | void> => {
		return (this._promise ||= navigator.mediaDevices.getUserMedia(constraints || DEFAULT_MEDIA_CONSTRAINTS).then(
			(stream: MediaStream) => {
				this._handleSuccessLaunch(stream);
				return stream;
			},
			err => this._handleErrorLaunch(err)
		));
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
