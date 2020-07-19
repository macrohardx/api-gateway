const ifaces = require('os').networkInterfaces();
const { get } = require('lodash/fp')
const dns = require('dns')
const config = require('../config')
const os = require('os')

const ipHelper = {}

ipHelper.maybeGetLanIpAddress = (patternToMatch) => {
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
        return Promise.resolve({ error: 'Unable to find ip with specified pattern', ok: false })
    }

    return Promise.resolve({ ipAddress: vpnIp, ok: true })
}

ipHelper.maybeGetHostName = (ip) =>
    promiseDnsRevere(ip)
        .then((domains) => domains.length ? Promise.resolve({ hostname: domains.join('.').toUpperCase(), ok: true }) : maybeGetLocalHostname(ip))
        .catch((error) => Promise.resolve({error, ok: false }))


const promiseDnsRevere = (ip) =>
    new Promise((resolve, reject) => dns.reverse(ip, (error, domains) =>
        error ? reject(error) : resolve(domains)))

const maybeGetLocalHostname = (ip) =>
    ipHelper.maybeGetLanIpAddress(config.lan_ip_pattern)
        .then(({ ipAddress }) => ipAddress === ip ? { hostname: os.hostname().toUpperCase(), ok: true } : { ok: false })


module.exports = ipHelper