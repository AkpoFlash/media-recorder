# media-recorder

# How to use
```jsx
const App = () => {
    const {blob, onStart, onStop, recorded, available, paused} = useMediaRecorder();
    return (
        <>
            {blob && <video src={URL.createObjectURL(blob)} autoPlay={true}/>}
            <div>
                <button onClick={onStart} children={'start'} disabled={recorded || !available}/>
                <button onClick={onStop} children={'stop'} disabled={!recorded || !available}/>
            </div>
        </>
    );
}
```
