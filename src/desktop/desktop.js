// TODO: Add custom window controls here
(function(window) {
    console.log('HERE');
    var gui = global.window.nwDispatcher.requireNwGui();
    var win = gui.Window.get();
    window.pressedMinimize = function() {
        win.minimize();
    };

    var isMaximized = false;
    window.pressedMaximize = function() {
        if(!isMaximized) {
            win.maximize();
        } else {
            win.restore();
        }
        isMaximized = !isMaximized;
    };
}(window));