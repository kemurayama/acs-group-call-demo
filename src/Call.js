import { useState } from 'react';
import { CallClient, LocalVideoStream } from "@azure/communication-calling";
import { AzureCommunicationTokenCredential } from '@azure/communication-common';
import { v1 as createGUID } from "uuid";
import MediaGallery from './MediaGallery';
import LocalStreamMedia from "./LocalStreamMedia";
import ScreenShare from './ScreenShare';
import { utils } from './Utils/Utils';
import './Call.css';

function Call() {
    const baseURL = "/api";
    const createUserURL = `${baseURL}/create_acs_user`;
    const issueTokenURL = `${baseURL}/issue_voip_token`;
    const [userName, setName] = useState("");
    const [acsID, setACSID] = useState("");
    const [voipToken, setVoIPToken] = useState("");
    const [callAgent, setCallAgent] = useState(null);
    const [deviceManager, setDeviceManager] = useState(null);
    const [selectedCameraDeviceId, setSelectedCameraDeviceId] = useState("");
    const [selectedMicrophoneDeviceId, setSelectedMicrophoneDeviceId] = useState("");
    const [selectedSpeakerDeviceId, setSelectedSpeakerDeviceId] = useState("");
    const [isVideoEnabled, setIsVideoEnabled] = useState(false);
    const [isScreenShared, setIsScreenShared] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [call, setCall] = useState(null);
    const [callState, setCallState] = useState("");
    const [screenShareStream, setScreenShareStream] = useState();
    const [view, setView] = useState(null);
    const [isMicrosphoneEnabled, setIsMicrophone] = useState(false);
    const [groupID, setGroupID] = useState(createGUID());
    const [localVideoStream, setLocalVideoStream] = useState(null);
    const array = crypto.getRandomValues(new Uint32Array(4));
    const tempUserName = "User" + String(...array);
    const [remoteParticipants, setRemoteParticiPants] = useState([]);

    const [speakers, setSpeakers] = useState();
    const [cameras, setCameras] = useState();
    const [microphones, setMicrophones] = useState();

    async function createUser() {
        async function requestCreateUSer(url, requestBody) {
            const response = await fetch(
                url,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: requestBody
                });
            if (!response.ok) {
                throw new Error('Response Error');
            }
            const responseJson = await response.json();
            return responseJson;
        }
        const requestBody = JSON.stringify({
            name: userName
        });
        const funcResponse = await requestCreateUSer(createUserURL, requestBody);
        setACSID(funcResponse.acs_id);
    };

    async function fetchNewTokenForCurrentUser() {
        const requestBody = JSON.stringify({
            acs_id: acsID
        });

        const tokenResponse = await fetch(issueTokenURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: requestBody
        });
        if (!tokenResponse.ok) {
            console.log(`Error at issue token with status ${tokenResponse.status}`);
            return;
        }
        const tokenJson = await tokenResponse.json();
        const token = tokenJson.access_token;
        return token;
    }

    async function issueVoIPToken() {
        const token = await fetchNewTokenForCurrentUser();
        setVoIPToken(token);
        await initClient(token);
    }

    async function initClient(token) {
        if (callAgent) {
            // Dipose before initialize callAgent if already callAgent is set.
            await callAgent.dispose();
        }
        try {
            const tokenCredential = new AzureCommunicationTokenCredential({
                tokenRefresher: fetchNewTokenForCurrentUser(),
                refreshProactively: true,
                token: token
            });
            const callClient = new CallClient();
            const addedCallAgent = await callClient.createCallAgent(tokenCredential, { displayName: userName ? userName : tempUserName });
            const addedDeviceManager = await callClient.getDeviceManager();
            const result = await addedDeviceManager.askDevicePermission(true, true);
            const speakers = await addedDeviceManager.getSpeakers();
            const microphones = await addedDeviceManager.getMicrophones();
            const cameras = await addedDeviceManager.getCameras();

            setSpeakers(speakers);
            setMicrophones(microphones);
            setCameras(cameras);

            if (result.audio !== undefined) {
                if (result.audio) {
                    setSelectedMicrophoneDeviceId(microphones[0].id);
                    setSelectedSpeakerDeviceId(speakers[0].id);
                }
            }
            if (result.video !== undefined) {
                if (result.video) {
                    setSelectedCameraDeviceId(cameras[0].id);
                }
            }
            setCallAgent(addedCallAgent);
            setDeviceManager(addedDeviceManager);

            addedCallAgent.on('callsUpdated', (e => {
                e.added.forEach(addedCall => {
                    if (call && addedCall.isIncoming) {
                        addedCall.reject();
                        return;
                    }
                    addedCall.on('stateChanged', () => {
                        setCallState(addedCall.state);
                    });

                    addedCall.on('remoteParticipantsUpdated', (ev) => {
                        ev.added.forEach((addedRemoteParticipant) => {
                            console.log('participantAdded', addedRemoteParticipant);
                            subscribeToParticipant(addedRemoteParticipant, addedCall);
                            setRemoteParticiPants([...addedCall.remoteParticipants]);
                        });

                        if (ev.removed.length > 0) {
                            console.log('participantRemoved');
                            setRemoteParticiPants([...addedCall.remoteParticipants]);
                        }
                    });

                    addedCall.on('isScreenSharingOnChanged', (ev) => {
                        console.log("Event is Shared");
                        setIsScreenSharing(addedCall.isScreenSharingOn);
                    });

                    const rp = [...addedCall.remoteParticipants];
                    rp.forEach((v) => subscribeToParticipant(v, addedCall));
                    setRemoteParticiPants(rp);
                    setCallState(addedCall.state);
                });

                e.removed.forEach(removedCall => {

                });

                const subscribeToParticipant = (participant, call) => {
                    const userId = utils.getId(participant.identifier);
                    participant.on('stateChanged', () => {
                        console.log('participant stateChanged', userId, participant.state);
                        setRemoteParticiPants([...call.remoteParticipants]);

                    });

                    participant.on('isSpeakingChanged', () => {
                        setRemoteParticiPants([...call.remoteParticipants]);
                    });

                    participant.on('videoStreamsUpdated', e => {
                        e.added.forEach(addedStream => {
                            if (addedStream.type === 'Video') {
                                return;
                            }
                            addedStream.on('isAvailableChanged', () => {
                                if (addedStream.isAvailable) {
                                    setScreenShareStream(addedStream);
                                    setIsScreenShared(true);
                                } else {
                                    setScreenShareStream(undefined);
                                    setIsScreenShared(false);
                                }
                            });
                        });
                    });
                };
            }));
        } catch (error) {
            console.log(error);
        }
    }

    async function toggleScreenShare() {
        if (call && !isScreenSharing) {
            await call.startScreenSharing();
        } else if (call && isScreenSharing) {
            await call.stopScreenSharing();
        }
        setIsScreenSharing(!isScreenSharing);
    }

    const handleGroupID = (event) => setGroupID(event.target.value);
    const handleNameChange = (event) => setName(event.target.value);
    const handleACSIDChange = (event) => setACSID(event.target.value);
    const handleVoIPToken = (event) => setVoIPToken(event.target.value);
    const handleCamera = (event) => setSelectedCameraDeviceId(event.target.value);

    const handleSpeaker = async (event) => {
        setSelectedSpeakerDeviceId(event.target.value)
        const speakerDeviceInfo = speakers.find(speakerDevice => {
            return speakerDevice.id === event.target.value;
        });
        deviceManager.selectSpeaker(speakerDeviceInfo);
    };
    const handleMicrophone = (event) => {
        setSelectedMicrophoneDeviceId(event.target.value);
        const microphoneDeviceInfo = microphones.find(microphoneDevice => {
            return microphoneDevice.id === event.target.value;
        });
        setIsMicrophone(true);
        deviceManager.selectMicrophone(microphoneDeviceInfo);
    };
    async function toggleVideoCamera() {
        const cameraDeviceInfo = await cameras.find(cameraDevice => {
            return cameraDevice.id === selectedCameraDeviceId;
        });

        const isVideo = !isVideoEnabled;
        const localvs = new LocalVideoStream(cameraDeviceInfo);
        setLocalVideoStream(isVideo ? localvs : undefined);
        setIsVideoEnabled(isVideo);

        if (isVideo && call) {
            await call.startVideo(localvs);
            console.log("Remove Video is sent");
        } else if (!isVideo && call) {
            try {
                await call.stopVideo(call.localVideoStreams[0]);
                view.dispose();
                console.log("Remove Video is stopped");
            } catch (error) {
                console.log(error);
            }
        } else if (!isVideo && !call) {
            if (view) {
                view.dispose();
            }
        }
    };

    async function toggleMicrophone() {
        try {
            if (isMicrosphoneEnabled && call) {
                await call.mute();
                setIsMicrophone(!isMicrosphoneEnabled);
                console.log("Microphone is disabled");
            } else if (!isMicrosphoneEnabled && call) {
                await call.unmute();
                setIsMicrophone(!isMicrosphoneEnabled);
                console.log("Microphone is eneabled");
            } else {
                setIsMicrophone(!isMicrosphoneEnabled);
            }
        } catch (error) {
            console.log(error);
        }
    };

    function startCall() {
        const locator = { groupId: groupID };
        const callOptions = getCallOptions();
        try {
            const call = callAgent.join(locator, callOptions);
            setCall(call);
        } catch (error) {
            console.log(error);
        }
    }

    function hangUpCall() {
        call.hangUp({ forEveryone: true });
        if (isVideoEnabled) {
            view.dispose();
            setIsVideoEnabled(!isVideoEnabled);
        }
    }

    function getCallOptions() {
        let callOptions = {
            videoOptions: {
                localVideoStreams: undefined
            },
            audioOptions: {
                muted: !isMicrosphoneEnabled
            }
        };

        if (isVideoEnabled) {
            callOptions.videoOptions = { localVideoStreams: [localVideoStream] };
        } else {
            callOptions.videoOptions = { localVideoStreams: undefined };
        }
        return callOptions;
    }

    return (
        <div className="Call-grid-container">
            <div className="Call-grid-item">
                Azure Communication Services Group Call Sample
            </div>
            <div className="Call-grid-item">
                <div className="Call-input-item">
                    <label htmlFor="name">1. Create User (Set User Name)</label>
                </div>
                <div className="Call-input-item">
                    <input itemType="text" name="name" id="name" onChange={handleNameChange} />
                </div>
                <div className="Call-input-item">
                    <button className="Call-button" itemType="button" onClick={createUser}> Create User </button>
                </div>
            </div>
            <div className="Call-grid-item">
                <div className="Call-input-item">
                    <label htmlFor="acsid">2. Set Azure Communication Service User ID for VoIP Token</label>
                </div>
                <div className="Call-input-item">
                    <input itemType="text" name="acsid" itemID="acs_id" size="80" value={acsID} onChange={handleACSIDChange} />
                </div>
                <div className="Call-input-item">
                    <label htmlFor="voip_token">VoIP Token</label>
                </div>
                <div className="Call-input-item">
                    <textarea name="voip_token" rows="11" cols="80" itemID="voip_token" value={voipToken} onChange={handleVoIPToken} />
                </div>
                <div className="Call-input-item">
                    <button className="Call-button" itemType="button" onClick={issueVoIPToken}>Issue Token </button>
                </div>
            </div>
            <div className="Call-grid-item">
                <div className="Call-input-item">
                    <label htmlFor="acsid">3. Select Your Device to Join Group Call (Get Token First)</label>
                </div>
                <div className="Call-input-item">
                    {callAgent && <p>Initialized Client Successfully</p>}
                </div>
                <div className="Call-input-item">
                    Camera : &nbsp;
                    <select className="Call-select" name="camera" id="camera" value={selectedCameraDeviceId} onChange={handleCamera}>
                        <option key="camera-none" id="camera-none" value="" >Not selected</option>
                        {
                            cameras &&
                            cameras.map(
                                camera => (<option key={camera.id} id={camera.id} value={camera.id} >{camera.name}</option>)
                            )
                        }
                    </select>
                </div>
                <div className="Call-input-item">
                    Microphone : &nbsp;
                    <select className="Call-select" name="microphone" id="microphone" value={selectedMicrophoneDeviceId} onChange={handleMicrophone}>
                        <option key="camera-none" id="camera-none" value="" >Not selected</option>
                        {
                            microphones &&
                            microphones.map(
                                microphone => (<option key={microphone.id} id={microphone.id} value={microphone.id} >{microphone.name}</option>)
                            )
                        }
                    </select>
                </div>
                <div className="Call-input-item">
                    Speaker : &nbsp;
                    <select className="Call-select" name="speaker" id="speaker" value={selectedSpeakerDeviceId} onChange={handleSpeaker}>
                        <option key="camera-none" id="camera-none" value="" >Not selected</option>
                        {
                            speakers &&
                            speakers.map(
                                speaker => (<option key={speaker.id} id={speaker.id} value={speaker.id} >{speaker.name}</option>)
                            )
                        }
                    </select>
                </div>
            </div>
            <div className="Call-grid-container">
                <div className="Call-grid-item">
                    4. Start Group Call
                </div>
                <div className="Call-grid-item">
                    <div className="Call-input-item">
                        <label htmlFor="groupid">Group ID</label>
                    </div>
                    <div className="Call-input-item">
                        <input itemType="text" name="groupid" size="60" itemID="group_id" value={groupID} onChange={handleGroupID} />
                    </div>
                    <div className="Call-input-item">
                        Call State: {callState ? callState : "Not Started"}
                    </div>
                </div>
                {
                    (call && call.state === "Connected") ?
                        (isScreenShared ?
                            <ScreenShare stream={screenShareStream} />
                            :
                            <MediaGallery
                                remoteParticipants={remoteParticipants}
                                userId={acsID}
                                displayName={userName ? userName : tempUserName}
                                localVideoStream={localVideoStream}
                                setView={setView}
                            />
                        )
                        :
                        <LocalStreamMedia stream={localVideoStream} setView={setView} />
                }
                <div className="Call-grid-item">
                    <button
                        className="Call-button"
                        itemType="button"
                        disabled={!selectedCameraDeviceId}
                        onClick={toggleVideoCamera}>
                        Camera {!isVideoEnabled ? "On" : "Off"}
                    </button>
                    <button
                        className="Call-button"
                        itemType="button"
                        disabled={!selectedMicrophoneDeviceId}
                        onClick={toggleMicrophone}>
                        Mic {!isMicrosphoneEnabled ? "On" : "Off"}
                    </button>
                    <button
                        className="Call-button"
                        itemType="button"
                        disabled={!callAgent}
                        onClick={startCall}>
                        Join Group Call
                    </button>
                    <button
                        className="Call-button"
                        itemType="button"
                        disabled={!call || call.state === "Disconnected"}
                        onClick={hangUpCall}>
                        Leave Group Call
                    </button>
                    <button
                        className="Call-button"
                        itemType="button"
                        disabled={!call || call.state === "Disconnected"}
                        onClick={toggleScreenShare}>
                        Screen Share {!isScreenSharing ? "On" : "Off"}
                    </button>
                </div>
            </div>
            <hr />
        </div>
    )
}

export default Call;