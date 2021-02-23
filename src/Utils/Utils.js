import { isCommunicationUserIdentifier, isPhoneNumberIdentifier } from '@azure/communication-common';

export const utils = {
    getIdentifierText: (identifier) => {
        if (isCommunicationUserIdentifier(identifier)) {
            return identifier.communicationUserId;
        } else if (isPhoneNumberIdentifier(identifier)) {
            return identifier.phoneNumber;
        } else {
            return 'Unknwon Identifier';
        }
    },
    getId: (identifier) => {
        if (isCommunicationUserIdentifier(identifier)) {
            return identifier.communicationUserId;
        } else if (isPhoneNumberIdentifier(identifier)) {
            return identifier.phoneNumber;
        } else {
            return identifier.id;
        }
    },
    getStreamId: (userId, stream) => {
        var id = stream.id;
        return `${userId}-${id}-${stream.type}`;
    }
}

