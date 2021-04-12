import { useEffect, useState } from "react";
import { VideoStreamRenderer } from "@azure/communication-calling";


function ScreenShare(props) {
    let rendererView;
    const streamId = "screenShare"
    const [available, setAvailable] = useState(false);

    useEffect(() => {
        (async () => {
            if (props.stream && props.stream.isAvailable) {
                setAvailable(true);
                var renderer = new VideoStreamRenderer(props.stream);
                // eslint-disable-next-line
                rendererView = await renderer.createView({
                    scalingMode: 'Crop',
                    mirrored: false
                });

                var container = document.getElementById(streamId);
                if (container && container.childElementCount === 0) {
                    container.appendChild(rendererView.target);
                }
            } else {
                setAvailable(false);
                if (rendererView) {
                    rendererView.dispose();
                }
            }
        })();

        return () => {
            if (rendererView) {
                rendererView.dispose();
                setAvailable(false);
            }
        };
    }, [props.stream]);

    return (
        <div className="MediaGallery-container">
            <div className="MediaGallery-container" style={{ display: available ? 'block' : 'none' }} id={streamId} />
        </div>
    );
}

export default ScreenShare;