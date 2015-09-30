chrome.serial.getDevices(function(ports) {
    ports.forEach(function (port) {
        var log = document.querySelector('#log');
        log.innerHTML += port.path+"<br>";
        console.log(port.path);
    });
});
chrome.usb.getDevices({"vendorId":4292, "productId":32778}, function(devices) {
    console.log("USB", devices);
    if (chrome.runtime.lastError != undefined) {
        console.warn("chrome.usb.getDevices error: "+chrome.runtime.lastError.message);
        return;
    }
    for (var device of devices) {
        console.log(device);
    }
});
