import { useRef } from 'react';
import { useRerender } from 'react-hookers';
import { MediaRecorderManager, MediaRecorderManagerOptions } from './mediaRecorderManager';

export const useMediaRecorder = (options?: MediaRecorderManagerOptions) => {
	const rerender = useRerender();
	return (useRef<MediaRecorderManager>().current ||= new MediaRecorderManager(rerender, options));
};
