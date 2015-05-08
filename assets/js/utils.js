/**
 * Utils
 *
 */


//
// error handle
function throwError(err){
    err = err || 'Something went wrong';
    notify('Sorry, Error occurred: ' + err);
}

//
// util notification
function notify(msg, delay){
    var ntf = $('.notification');
    delay = delay || 4000;
    if(ntf.is('__active')) return;

    ntf.find('.message').text(msg);

    withDelay(
        function(){ ntf.addClass('__active'); },
        function(){ ntf.removeClass('__active'); },
        delay
    );
}

//
// loading control
$.fn.loadingOn = function(cb){
    cb = cb || null;
    this.addClass('__loading');
    if(cb) cb();
};

$.fn.loadingOff = function(cb){
    cb = cb || null;
    this.removeClass('__loading');
    if(cb) cb();
};

//
// common delay wrapper
function withDelay(fn, cb, delay){
    delay = delay || 2000;
    fn();
    setTimeout(function(){
        cb();
    }, delay);
}
