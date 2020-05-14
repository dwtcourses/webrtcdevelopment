/**
 * Update local cache of user sesssion based object called peerinfo
 * @method
 * @name updateWebCallView
 * @param {json} peerInfo
 */
function updateWebCallView(peerinfo) {
    let myrole = role;
    webrtcdev.log("[webcallviewmanager] - updateWebCallView start with ",
        " peerinfo", peerinfo, " peerinfo role ", peerinfo.role,
        " | myrole :", myrole);

    switch (myrole) {

        case "inspector":
            var emptyvideoindex = 0;
            for (var v = 0; v < remoteVideos.length; v++) {
                webrtcdev.log(" [webcallviewmanager] Remote Video index array ", v, " || ", remoteVideos[v],
                    document.getElementsByName(remoteVideos[v]),
                    document.getElementsByName(remoteVideos[v]).src);
                if (remoteVideos[v].src) {
                    emptyvideoindex++;
                }
            }

            let video = document.createElement('video');
            remoteVideos[emptyvideoindex] = video;
            document.getElementById(remoteobj.videoContainer).appendChild(video);

            let remvid = remoteVideos[emptyvideoindex];
            webrtcdev.log(" [webcallviewmanager] updateWebCallView role-inspector , attaching stream", remvid, peerinfo.stream);
            attachMediaStream(remvid, peerinfo.stream).then(_ => {
                if (remvid.hidden) removid.hidden = false;
                remvid.id = peerinfo.videoContainer;
                remvid.className = remoteobj.videoClass;
                //attachControlButtons(remvid, peerInfo);

                if (remoteobj.userDisplay && peerinfo.name) {
                    attachUserDetails(remvid, peerinfo);
                }
                if (remoteobj.userMetaDisplay && peerinfo.userid) {
                    attachMetaUserDetails(remvid, peerinfo);
                }
                // Hide the unsed video for Local
                var _templ = document.getElementsByName(localVideo)[0];
                if (_templ) _templ.hidden = true;

                for (v in remoteobj.videoarr) {
                    var _templ2 = document.getElementsByName(remoteobj.videoarr[v])[0];
                    if (_templ2) _templ2.setAttribute("style", "display:none");
                }
            });

            for (let t in document.getElementsByClassName("timeBox")) {
                document.getElementsByClassName("timeBox")[t].hidden = true;
            }
            break;

        case "participant":
        case "host":
        case "guest":
            if (peerinfo.vid.indexOf("videolocal") > -1) {

                // when video is local
                webrtcdev.info("[webcallviewdevmanager] - role-participant , peerinfo Vid is Local");

                updateWaitingWebCallView(peerinfo);

            } else if (peerinfo.vid.indexOf("videoremote") > -1) {

                //when video is remote
                webrtcdev.info("[webcallviewdevmanager] updateWebCallView - role - ", peerinfo.role, " peerinfo Vid type - ", peerinfo.type);

                updateLocalWebCallView(webcallpeers[0]);

                updateRemoteWebCalView(peerinfo);

            } else {
                webrtcdev.error("[webcallviewdevmanager] updateWebCallView-  PeerInfo vid didnt match either case ", peerinfo.vid);
            }
            break;

        default:
            webrtcdev.error("[webcallviewdevmanager] updateWebCallView -  No role found to update webcall view ", myrole);
    }
}

/**
 * Update local cache of user session based object called peerinfo
 * @method
 * @name updateWaitingWebCallView
 * @param {json} peerInfo
 */
function updateWaitingWebCallView(peerinfo){
    if (localVideo && document.getElementsByName(localVideo)[0]) {
        let vid = document.getElementsByName(localVideo)[0];
        attachMediaStream(vid, peerinfo.stream).then(_ => {
            webrtcdev.log('[webcallviewdevmanager] updateWaitingWebCallView - Done attaching local stream to element', vid);
            vid.muted = true;
            vid.className = localobj.videoClass;

            if (localobj.userDisplay && peerinfo.name)
                attachUserDetails(vid, peerinfo);

            if (localobj.userMetaDisplay && peerinfo.userid)
                attachMetaUserDetails(vid, peerinfo);
        });

    } else {
        //alert(" Please Add a video container in config for single");
        webrtcdev.error("[webcallviewdevmanager] updateWaitingWebCallView - No local video container in localobj -> ", localobj);
    }
}

/**
 * Update local cache of user sesssion based object called peerinfo
 * @method
 * @name updateLocalWebCallView
 * @param {json} peerInfo
 */
function updateLocalWebCallView(selfpeerinfo){
    // handling local video addition to session using reattach
    if ( localVideo && selfVideo) {

        // chk if local video is added to conf , else adding local video to index 0
        //localvid : Local video container before session
        const localvid = document.getElementsByName(localVideo)[0];
        // selfvid : local video in a  session
        const selfvid = document.getElementsByName(selfVideo)[0];

        if(!outgoingVideo){
            webrtcdev.error("[webcallviewdevmanager] updateLocalWebCallView - Outgoing Local video is ", outgoingVideo);
        }

        if(!outgoingAudio){
            webrtcdev.error("[webcallviewdevmanager] updateLocalWebCallView - Outgoing Local Audio is ", outgoingAudio);
        }

        if (selfvid.played.length <= 0) {
            let pr;
            if (localvid.played.length > 0) {
                webrtcdev.log("[webcallviewdevmanager] updateLocalWebCallView - local video is playing , just reattach stream to add in session");
                pr = reattachMediaStream(selfvid, localvid);
            } else {
                webrtcdev.log("[webcallviewdevmanager] updateLocalWebCallView - local video is not playing ,use webcallpeers for stream to add in session");
                pr = attachMediaStream(selfvid, selfpeerinfo.stream);
            }

            pr.then(_ => {
                webrtcdev.log('[ webcallviewdevmanager ] updateLocalWebCallView - Done attaching local stream to local element');
                if (localobj.userDisplay && selfpeerinfo.name) {
                    attachUserDetails(selfvid, selfpeerinfo);
                }

                if (localobj.userMetaDisplay && selfpeerinfo.userid) {
                    attachMetaUserDetails(selfvid, selfpeerinfo);
                }

                selfvid.id = selfpeerinfo.videoContainer;
                selfvid.className = remoteobj.videoClass;
                selfvid.muted = true;
                attachControlButtons(selfvid, selfpeerinfo);
            });

        } else {
            webrtcdev.log("[webcallviewdevmanager] updateLocalWebCallView - not updating self video as it is already playing ", selfvid.played.length);
            return;
        }

    } else {
        webrtcdev.error("[webcallviewdevmanager] updateLocalWebCallView - Local video container not defined ");
        alert(" Please Add a video container in config for video call ");
    }
}

function updateRemoteWebCalView(peerinfo){
    // handling remote video addition
    if (incomingVideo && remoteVideos) {

        let emptyvideoindex = findEmptyRemoteVideoIndex(peerinfo, remoteVideos);
        updateRemoteVideos(peerinfo, remoteVideos, emptyvideoindex);

        webrtcdev.log("[webcallviewdevmanager] updateRemoteWebCalView - remote video attachMediaStream");
        attachMediaStream(remoteVideos[emptyvideoindex], peerinfo.stream)
            .then(_ => {
                webrtcdev.log('[ webcallviewdevmanager ] updateRemoteWebCalView - Done attaching remote stream to remote element');

                if (remoteVideos[emptyvideoindex]) {
                    showelem(remoteVideos[emptyvideoindex].video);

                    if (remoteobj.userDisplay && peerinfo.name) {
                        attachUserDetails(remoteVideos[emptyvideoindex].video, peerinfo);
                    }

                    if (remoteobj.userMetaDisplay && peerinfo.userid) {
                        attachMetaUserDetails(remoteVideos[emptyvideoindex].video, peerInfo);
                    }

                    remoteVideos[emptyvideoindex].video.id = peerinfo.videoContainer;
                    remoteVideos[emptyvideoindex].video.className = remoteobj.videoClass;
                    attachControlButtons(remoteVideos[emptyvideoindex].video, peerinfo);
                }
            });

    } else {
        webrtcdev.error("[webcallviewdevmanager] updateRemoteWebCalView - remote Video containers not defined ", remoteVideos);
        alert("remote Video containers not defined");
    }

}
/**
 * destroy users webcall view
 * @method
 * @name destroyWebCallView
 * @param {json} peerInfo
 * @param {function} callback
 */
function destroyWebCallView(peerInfo) {

    webrtcdev.warn("[webcallviewmanager] destroyWebCallView peerInfo", peerInfo);
    if (peerInfo.videoContainer && document.getElementById(peerInfo.videoContainer)) {
        let video = document.getElementById(peerInfo.videoContainer);
        if (!video) {
            webrtcdev.warn("[webcallviewmanager] destroywebcallview - video not found for the peer who left");
        }
        detachMediaStream(video);
        video.setAttribute("hidden", true);
    }

    // clean up old file sharing boxes
    if (fileshareobj.props.fileList != "single") {
        // if it is p2p session and only 2 File Listing boxes are already present remove the already existing remote file listing box

        let filelistingrow = document.getElementById("fileListingRow");
        if (filelistingrow.childElementCount >= 2) {
            webrtcdev.warn("[webcallviewmanager] destroywebcallview - more than 1 file listing rows present, remove the ones for peers that are no longer in session  ");
            let filelistingboxes = filelistingrow.childNodes;

            for (x in filelistingboxes) {
                if (!filelistingboxes[x].id) break;

                let fid = filelistingboxes[x].id.split("widget-filelisting-box");
                if(peerInfo.userid == fid[1]) {
                    webrtcdev.warn("[webcallviewmanager] destroywebcallview - File list boxes belonging to userid ", fid[1], " need to be removed  ");
                    filelistingrow.removeChild(filelistingboxes[x]);
                    break;
                }
            }
        }

        // if it is p2p session and only 2 File sharing boxes are already present remove the already existing remote file sharing box
        let fileSharingrow = getElementById("fileSharingRow");
        if (fileSharingrow.childElementCount >= 2) {
            webrtcdev.warn("[webcallviewmanager] destroyWebCallView - more than 1 file listing rows present , remove the ones for peers that are no longer in session  ");
            let fileSharingboxes = fileSharingrow.childNodes;

            for (x in fileSharingboxes) {
                if (!fileSharingboxes[x].id) break;

                let fid = fileSharingboxes[x].id.split("widget-filesharing-box");
                if(peerInfo.userid == fid[1]) {
                    webrtcdev.warn("[webcallviewmanager] destroywebcallview - File list boxes belonging to userid ", fid[1], " need to be removed  ");
                    fileSharingrow.removeChild(fileSharingboxes[x]);
                    break;
                }
            }
        }
    }

    /*if(fileshareobj.active){
        if(fileshareobj.props.fileShare){
            if(fileshareobj.props.fileShare=="divided")
                webrtcdev.log("dont remove it now ");
                //createFileSharingDiv(peerInfo);
            else if(fileshareobj.props.fileShare=="single")
                webrtcdev.log("No Seprate div created for this peer  s fileshare container is single");
            else
                webrtcdev.log("props undefined ");
        }
    }*/

    // list of all active remote user ids
    let activeRemotepeerids = "";
    for (i in webcallpeers) {
        if (webcallpeers[i].type == "remote")
            activeRemotepeerids += webcallpeers[i].userid;
    }
    webrtcdev.log("Active Remote Peers  ", activeRemotepeerids);
}


/**
 * update Remote Video array of json objects
 * @method
 * @name updateRemoteVideos
 * @param {json} peerinfo
 * @param {json} remoteVideos
 * @param {int} emptyvideoindex
 */
function updateRemoteVideos(peerinfo, remoteVideos, emptyvideoindex) {

    if (!emptyvideoindex) return;
    webrtcdev.log("[webcallviewmanager] updateRemoteVideos - current empty video index -", emptyvideoindex);

    if (!remoteVideos || !peerinfo) return;

    try {

        if (remoteobj.maxAllowed == "unlimited") {
            // unlimitted video can be added dynamically
            webrtcdev.log("[webcallviewmanager ] updateRemoteVideos - remote video is unlimited , creating video for remoteVideos array ");
            let video = document.createElement('video');
            //  added  new video element to remoteVideos at current index
            remoteVideos[emptyvideoindex] = {
                "userid": peerinfo.userid,
                "stream": peerinfo.stream,
                "video": video
            };
            document.getElementById(remoteobj.dynamicVideos.videoContainer).appendChild(video);

        } else {
            //remote video is limited to size maxAllowed
            webrtcdev.log("[webcallviewmanager] updateRemoteVideos - Max-capacity is limited to size -", remoteobj.maxAllowed);
            webrtcdev.log("[webcallviewmanager] updateRemoteVideos - remoteVideos -", remoteVideos);

            if (emptyvideoindex > remoteVideos.length) {
                webrtcdev.error("[webcallviewmanager] current index is larger than remote video length ");
                return;
            }

            let remVideoHolder = document.getElementsByName(remoteVideos[emptyvideoindex]);
            webrtcdev.log("[webcallviewmanager] updateRemoteVideos - update remote video : ", remVideoHolder);
            if (remVideoHolder && remVideoHolder.length >= 0) {
                if (remVideoHolder[0]) {
                    // since remvideo holder exist at current index , add video element to remoteVideos
                    remoteVideos[emptyvideoindex] = {
                        "userid": peerinfo.userid,
                        "stream": peerinfo.stream,
                        "video": remVideoHolder[0]
                    };
                    webrtcdev.log("[webcallviewmanager] updateRemoteVideos - RemoteVideos[" + emptyvideoindex + "] updated ", remoteVideos[emptyvideoindex], peerinfo.stream);
                }

            } else if (remoteVideos[emptyvideoindex].userid == peerinfo.userid && remoteVideos[emptyvideoindex].stream == "") {
                // pre-existing video with stream = "" , update stream
                webrtcdev.warn("[webcallviewmanager] updateRemoteVideos - since remvideo holder already exists with '' stream just overwrite the stream ");
                remoteVideos[emptyvideoindex].stream = peerinfo.stream;

            } else {
                webrtcdev.warn("[webcallviewmanager] updateRemoteVideos - since remvideo holder doesnt exist just overwrite the last remote with the video ");
                // since remvideo holder doesnt exist just overwrite the last remote with the video
                remoteVideos[remoteVideos.length - 1] = {
                    "userid": peerinfo.userid,
                    "stream": peerinfo.stream,
                    "video": remVideoHolder[0]
                };
                webrtcdev.log("[webcallviewmanager ] updateRemoteVideos - RemoteVideos[" + remoteVideos.length - 1 + "] updated ", remoteVideos[emptyvideoindex]);
            }
        }
        webrtcdev.log("[webcallviewmanager ] updateRemoteVideos - remoteVideos after updating ", remoteVideos[emptyvideoindex]);
    } catch (err) {
        webrtcdev.error("[webcallviewmanager ] updateRemoteVideos - ", err);
    }
}


/**
 * find empty remote video index
 * @method
 * @name findEmptyRemoteVideoIndex
 * @param {json} remoteobj
 * @param {json} remoteVideos
 * @return {int} emptyvideoindex
 */
function findEmptyRemoteVideoIndex(peerinfo, remoteVideos) {
    /* get the next empty index of video and pointer in remote video array */
    let eindex = 0;

    if(peerinfo.videoContainer){
        if(document.getElementById(peerinfo.videoContainer).srcObject && document.getElementById(peerinfo.videoContainer).srcObject.active){
            webrtcdev.info("[webcallviewdevmanager] findEmptyRemoteVideoIndex - Peer already ahs a playing video ");
            return;
        }
    }

    for (v in remoteVideos) {
        webrtcdev.info("[webcallviewdevmanager] findEmptyRemoteVideoIndex - Remote Video index array ", v, " || ", remoteVideos[v]);

        //  video container of remote peer is already present in remoteVideos , break the loop and skip to next
        if (remoteVideos[v].userid == peerinfo.userid && (remoteVideos[v].stream == "" || !remoteVideos[v].stream) && !!remoteVideos[v].video) {
            webrtcdev.log("[webcallviewdevmanager] findEmptyRemoteVideoIndex - Remote Video dom exist already for the userid, checking for srcobject ");
            if (!remoteVideos[v].video.srcObject) {
                webrtcdev.info("[webcallviewdevmanager] findEmptyRemoteVideoIndex - Remote Video dom exist already but without stream", remoteVideos[v].video);
                eindex = v;
                break;
            }

        } else {

            let vids = document.getElementsByName(remoteVideos[v]);

            // video container of peer is not present in remoteVideos yet
            if (!remoteVideos[v].video) {
                webrtcdev.log("[webcallviewdevmanager] findEmptyRemoteVideoIndex- Remote Video is not appended by json ", vids);
                if (vids.length <= 0) {
                    webrtcdev.log("[webcallviewdevmanager] findEmptyRemoteVideoIndex - Remote video space is empty ");
                    eindex = v;
                    break;
                } else {
                    webrtcdev.log("[webcallviewdevmanager] findEmptyRemoteVideoIndex -  Remote video space exists ", vids[0]);
                    vids = vids[0];
                }

            } else {
                webrtcdev.log("[webcallviewdevmanager] findEmptyRemoteVideoIndex -  Remote Video has json appended ", remoteVideos[v]);
                vids = remoteVideos[v].video;
            }

            webrtcdev.log("[webcallviewdevmanager] vids.src ", vids.src,
                " , vids.srcObject ", vids.srcObject,
                " , vids.readyState ", vids.readyState,
                " , vids.played.length ", vids.played.length);

            if (vids && vids.srcObject) {
                if (vids.srcObject.active) {
                    webrtcdev.log("[webcallviewdevmanager] findEmptyRemoteVideoIndex - video is already appended and playing ", vids,
                        " vids.srcObject.active ", vids.srcObject.active, " move to next iteration");
                    eindex++;
                } else {
                    webrtcdev.log("[webcallviewdevmanager] findEmptyRemoteVideoIndex- video is already appended , but not playing ", vids,
                        " vids.srcObject.active ", vids.srcObject.active, " use this index");
                    eindex = v;
                    break;
                }

            } else if (vids && !vids.srcObject) {
                webrtcdev.log("[webcallviewdevmanager] findEmptyRemoteVideoIndex - video is not played ", vids, "use this index ");
                eindex = v;
                break;

            } else {
                webrtcdev.warn("[webcallviewdevmanager] findEmptyRemoteVideoIndex - Not sure whats up with the video ", vids, " move to next iteration");
                eindex++;
            }
        }
    }

    webrtcdev.log("[webcallviewmanager] findEmptyRemoteVideoIndex -  empty video index ", eindex, remoteVideos[eindex]);
    return eindex;
}

