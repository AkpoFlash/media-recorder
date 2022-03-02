# media-recorder

# How to use
```jsx
import {useMediaRecorder} from '@akpoflash/media-recorder'

function App(){
    const mediaRecorder = useMediaRecorder();
    const video = useRef();

    useEffect(() => {
        mediaRecorder.init().then(stream => {
            video.current.srcObject = stream
        });
    },[]);

    return (
        <>
            {/* real time streaming */}
            <video ref={video} autoPlay={true}/>
            {/* recordered video */}
            {mediaRecorder.blob && <video width={100} src={URL.createObjectURL(mediaRecorder.blob)} autoPlay={true}/>}
            <div>
                <button onClick={mediaRecorder.start} children={'start'} disabled={mediaRecorder.recorded || !mediaRecorder.available}/>
                <button onClick={mediaRecorder.stop} children={'stop'} disabled={!mediaRecorder.recorded || !mediaRecorder.available}/>
                <br/>
                <button onClick={mediaRecorder.pause} children={'pause'} disabled={!mediaRecorder.recorded || mediaRecorder.paused || !mediaRecorder.available}/>
                <button onClick={mediaRecorder.resume} children={'resume'} disabled={!mediaRecorder.recorded || !mediaRecorder.paused || !mediaRecorder.available}/>
            </div>
        </>
    );
}
```
