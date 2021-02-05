import { isCallingApplicationIdentifier, isPhoneNumberIdentifier, isCommunicationUserIdentifier } from '@azure/communication-common';

export const utils = {
    getIdentifierText: (identifier) => {
        if (isCommunicationUserIdentifier(identifier)) {
            return identifier.communicationUserId;
        } else if (isPhoneNumberIdentifier(identifier)) {
            return identifier.phoneNumber;
        } else if (isCallingApplicationIdentifier(identifier)) {
            return identifier.callingApplicationId;
        } else {
            return 'Unknwon Identifier';
        }
    },
    getId: (identifier) => {
        if (isCommunicationUserIdentifier(identifier)) {
            return identifier.communicationUserId;
        } else if (isCallingApplicationIdentifier(identifier)) {
            return identifier.callingApplicationId;
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

