import { useEffect, useState } from "react";
import { VideoStreamRenderer } from "@azure/communication-calling";
import "./MediaGallery.css"


function LocalStreamMedia(props) {
    let rendererView;
    const [available, setAvailable] = useState(false);
    const videoID = "localVideo";

    useEffect(() => {
        (async () => {
            if (props.stream) {
                var renderer = new VideoStreamRenderer(props.stream);

                // eslint-disable-next-line
                rendererView = await renderer.createView({ scalingMode: 'Crop' });
                props.setView(rendererView);

                var container = document.getElementById(videoID);
                if (container && container.childElementCount === 0) {
                    container.appendChild(rendererView.target);
                    setAvailable(true);
                }
            } else {
                if (rendererView) {
                    rendererView.dispose();
                    setAvailable(false);
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
            <div className="MediaGallery-container" style={{ display: available ? 'block' : 'none' }} id={videoID} />
        </div>
    )
}

export default LocalStreamMedia;