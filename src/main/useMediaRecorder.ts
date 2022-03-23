import { useRef } from 'react';
import { useRerender } from 'react-hookers';
import { MediaRecorderManager } from './mediaRecorderManager';

export const useMediaRecorder = () => {
	const rerender = useRerender();
	return (useRef<MediaRecorderManager>().current ||= new MediaRecorderManager(rerender));
};
