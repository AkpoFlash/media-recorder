import { useRef } from 'react';
import { useRerender } from 'react-hookers';
import { MediaRecorderManager } from './mediaRecorderManager';

export const useMediaRecorder = () => {
	const rerender = useRerender();
	const ref = useRef<MediaRecorderManager>(new MediaRecorderManager(rerender));
	return ref.current;
};
