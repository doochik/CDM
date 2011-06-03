/**
 * Обертка над postMessage, которая умеет отправляет через него любые данные, а не только строки.
 * CDM — Cross-document messaging
 * @see http://wiki.yandex-team.ru/AlekseyAndrosov/js/xdr
 * @see http://www.w3.org/TR/webmessaging/
 * @see http://dev.w3.org/html5/postmsg/
 * @see http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html
 * @see http://msdn.microsoft.com/en-us/library/cc197015(VS.85).aspx
 * @see https://developer.mozilla.org/En/DOM:window.postMessage
 */
var CDM = (function(/**window*/window) {
    if (!('postMessage' in window) || !('JSON' in window)) {
        return;
    }

    var postMessageSendsAnyData = false;

    var bind;

    if (window.addEventListener) {
        window.addEventListener('message', testSupport, false);
        bind = function(window, callback) {
            console.log('bind');
            window.addEventListener('message', onMessageWrapper(callback), false);
        }
    } else {
        window.attachEvent('onmessage', testSupport);
        bind = function(window, callback) {
            window.attachEvent('message', onMessageWrapper(callback), false);
        }
    }

    window.postMessage({"CDM": "test"}, window.location.origin);

    return {
        /**
         *
         * @param {window} window
         * @param message
         * @param targetOrigin
         */
        send: function(window, message, targetOrigin) {
            if (!postMessageSendsAnyData) {
                message = JSON.stringify(message);
            }
            window.postMessage(message, targetOrigin);
        },

        /**
         * @param {window} window
         * @param {Function} callback
         */
        bind: bind
    };

    function onMessageWrapper(callback) {
        return function(event) {
            if (postMessageSendsAnyData) {
                callback(event);
            } else {
                var eventWrapper = {
                    // eval json from event
                    data: JSON.parse(event.data),
                    origin: event.origin,
                    source: event.source
                };
                callback(eventWrapper);
            }
        }
    }

    /**
     * Проверяет поддержку того, что postMessage может пересылвать не только строки.
     * @param {Event} e Событие.
     */
    function testSupport(e) {
        var data = e.data;
        if (typeof data !== 'string' && data.CDM === 'test') {
            postMessageSendsAnyData = true;
        }

        console.log('testSupport', postMessageSendsAnyData);

        // remove test function
        if (window.removeEventListener) {
            window.removeEventListener('message', testSupport, false);
        } else {
            window.detachEvent('onmessage', testSupport);
        }
    }
})(window);