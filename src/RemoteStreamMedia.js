import { useState, useEffect } from "react";
import { VideoStreamRenderer } from "@azure/communication-calling";
import { utils } from "./Utils/Utils";
import "./MediaGallery.css";


function RemoteStreamMedia(props) {
    let rendererView;
    let streamId = props.stream ? utils.getStreamId(props.label, props.stream) : `${props.label} - no stream`;
    const [available, setAvailable] = useState(false);
    const stream = props.stream;

    useEffect(() => {
        const renderStream = async () => {
            var container = document.getElementById(streamId);
            if (container && props.stream && props.stream.isAvailable) {
                setAvailable(true);
                var renderer = new VideoStreamRenderer(props.stream);
                // eslint-disable-next-line
                rendererView = await renderer.createView({ scalingMode: 'Crop' });
                if (container && container.childElementCount === 0) {
                    container.appendChild(rendererView.target);
                }
            } else {
                setAvailable(false);
                if (rendererView) {
                    rendererView.dispose();
                }
            }
        };
        if (!stream) {
            return;
        }
        stream.on('isAvailableChanged', renderStream);

        if (stream.isAvailable) {
            renderStream();
        }

        return () => {
            if (rendererView) {
                rendererView.dispose();
                setAvailable(false);
            };
        }
    }, [stream]);

    return (
        <div className="MediaGallery-container">
            <div className="MediaGallery-container" style={{ display: available ? 'block' : 'none' }} id={streamId} />
        </div>
    );
}

export default RemoteStreamMedia;
