const GLib = imports.gi.GLib;
const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;

let text, button;

function _hideStatus() {
    Main.uiGroup.remove_actor(text);
    text = null;
}

function _showStatus(status) {
    if (!text) {
        text = new St.Label({style_class: 'helloworld-label', text: 'Laptop Mode ' + status});
        Main.uiGroup.add_actor(text);
    }

    text.opacity = 255;

    let monitor = Main.layoutManager.primaryMonitor;

    text.set_position(monitor.x + Math.floor(monitor.width / 2 - text.width / 2),
        monitor.y + Math.floor(monitor.height / 2 - text.height / 2));

    Tweener.addTween(text,
        {
            opacity: 0,
            time: 2,
            transition: 'easeOutQuad',
            onComplete: _hideStatus
        });
}

function _setOn(){
    GLib.spawn_command_line_async('sh -c "pkexec --user root systemctl ' + 'start' + ' laptop-mode' + '; exit;"');
}

function _setOff(){
    GLib.spawn_command_line_async('sh -c "pkexec --user root systemctl ' + 'stop' + ' laptop-mode' + '; exit;"');
}

function _checkStatus() {
    // check status
    let [_, out] = GLib.spawn_command_line_sync('systemctl status --no-block laptop-mode');
    out = out.toString();
    if (out.match(/Loaded: loaded/g)) {
        found = true;
        if (out.match(/Active: (active|activating)/g)) {
            active = true;
        }
        return true;
    }

    return false;
}

function _toggleStatus() {
    if (!_checkStatus()) {
        _setOn();
        _showStatus('ON')
    } else {
        _setOff();
        _showStatus('OFF')
    }
}

function init() {
    button = new St.Bin({
        style_class: 'panel-button',
        reactive: true,
        can_focus: true,
        x_fill: true,
        y_fill: false,
        track_hover: true
    });
    let icon = new St.Icon({
        icon_name: 'system-run-symbolic',
        style_class: 'system-status-icon'
    });

    button.set_child(icon);
    button.connect('button-press-event', _toggleStatus);
}

function enable() {
    Main.panel._rightBox.insert_child_at_index(button, 0);
}

function disable() {
    Main.panel._rightBox.remove_child(button);
}
