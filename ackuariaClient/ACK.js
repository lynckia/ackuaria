/*global console, CryptoJS, XMLHttpRequest*/
var ACK = ACK || {};
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

ACK.url = 'http://localhost:8888/';
ACK.author = 'nachoaguado@dit.upm.es';

ACK.version = 1;

ACK.API = (function (ACK) {
    "use strict";

    var getSessions, getSession, getSessionsOfRoom, getSessionsOfUser, getInfo, getInfoOfRoom, getInfoOfUser, getEvents, getEventsOfRoom, getEventsOfUser, getEventsOfType, send;

    getSessions = function(callback, callbackError) {
        send(callback, callbackError, 'GET', undefined, 'sessions');
    }

    getSessionsOfRoom = function(room, callback, callbackError) {
        send(callback, callbackError, 'GET', undefined, 'sessions/room/' + room);
    }

    getSessionsOfUser = function(user, callback, callbackError) {
        send(callback, callbackError, 'GET', undefined, 'sessions/user/' + user);
    }

    getInfo = function(callback, callbackError) {
        send(callback, callbackError, 'GET', undefined, 'info');
    }

    getInfoOfRoom = function(room, callback, callbackError) {
        send(callback, callbackError, 'GET', undefined, 'info/room/' + room);
    }
    
    getInfoOfUser = function(user, callback, callbackError) {
        send(callback, callbackError, 'GET', undefined, 'info/user/' + user);
    }

    getEvents = function(callback, callbackError) {
        send(callback, callbackError, 'GET', undefined, 'events');
    }

    getEventsOfRoom = function(room, callback, callbackError) {
        send(callback, callbackError, 'GET', undefined, 'events/room/' + room);
    }
    
    getEventsOfUser = function(user, callback, callbackError) {
        send(callback, callbackError, 'GET', undefined, 'events/user/' + user);
    }

    getEventsOfType = function(type, callback, callbackError) {
        send(callback, callbackError, 'GET', undefined, 'events/type/' + type);
    }

    send = function (callback, callbackError, method, body, url) {
        var service, key, timestamp, cnounce, toSign, header, signed, req;
        var fullURL = ACK.url + url;
        var req = new XMLHttpRequest();

        req.open(method, fullURL, true);

        if (body !== undefined) {
            req.setRequestHeader('Content-Type', 'application/json');
            req.send(JSON.stringify(body));
        } else {
            req.send();
        }

    };

    return { 
        getSessions: getSessions,
        getSessionsOfRoom: getSessionsOfRoom,
        getSessionsOfUser: getSessionsOfUser,
        getInfo: getInfo,
        getInfoOfRoom: getInfoOfRoom,
        getInfoOfUser: getInfoOfUser,
        getEvents: getEvents,
        getEventsOfRoom: getEventsOfRoom,
        getEventsOfUser: getEventsOfUser,
        getEventsOfType: getEventsOfType
    }
}(ACK));

module.exports = ACK;