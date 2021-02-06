import { useCallback, useState } from "react";
import RemoteStreamMedia from './RemoteStreamMedia';
import LocalStreamMedia from './LocalStreamMedia';
import { utils } from "./Utils/Utils";

function MediaGallery(props) {
    const [gridCol, setGridCol] = useState(1);
    const [gridRow, setGridRow] = useState(1);

    const calculateNumberOfRows = useCallback(
        (participants, gridCol) => Math.ceil((participants.length + 1) / gridCol),
        []
    );

    const calculateNumberOfColumns = useCallback(
        (participants) => (participants && participants.length > 0 ? Math.ceil(Math.sqrt(participants.length + 1)) : 1),
        []
    );

    function getMediaGalleryTilesForParticipants(participants, userId, displayName) {

        const remoteParticipantMedia = participants.map(participant => (
            <div className="MediaGallery-Style" key={utils.getId(participant.identifier)}>
                <RemoteStreamMedia
                    key={utils.getId(participant.identifier)}
                    stream={participant.videoStreams[0]}
                    label={displayName ?? utils.getId(participant.identifier)}
                />
            </div>
        ));

        const localParticipantMedia = (
            <div className="MediaGallery-Style" key={userId}>
                <LocalStreamMedia key={userId} stream={props.localVideoStream} setView={props.setView} />
            </div>
        );
        remoteParticipantMedia.unshift(localParticipantMedia);
        return remoteParticipantMedia;
    };

    const numberOfColumns = calculateNumberOfColumns(props.remoteParticipants);
    if (numberOfColumns !== gridCol) setGridCol(numberOfColumns);
    const numberOfRows = calculateNumberOfRows(props.remoteParticipants, gridCol);
    if (numberOfRows !== gridRow) setGridRow(numberOfRows);
    return (
        <div
            style={{ gridTemplateRows: `repeat(${gridRow}, minmax(0, 1fr))`, gridTemplateColumns: `repeat(${gridCol}, 1fr)` }}
            className="MediaGallery"
        >
            {getMediaGalleryTilesForParticipants(props.remoteParticipants, props.userId, props.displayName)}
        </div>
    );
}

export default MediaGallery;