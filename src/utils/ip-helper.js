const ifaces = require('os').networkInterfaces();
const { get } = require('lodash/fp')

module.exports = {
    maybeGetLanIpAddress: (patternToMatch) => {
        let vpnIp = null;

        Object.keys(ifaces).forEach((ifname) => {

            if (vpnIp) { return; }

            const iface = ifaces[ifname].find((f) => {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                if ('IPv4' !== f.family || f.internal !== false) {
                    return false;
                }

                if (f.address.indexOf(patternToMatch) !== -1) {
                    return true;
                }
            });

            vpnIp = get('address', iface)
        });

        if (!vpnIp) {
            return { error: 'Unable to find ip with specified pattern' }
        }

        return { ipAddress: vpnIp };
    }
}

