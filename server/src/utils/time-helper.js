module.exports = {
    toMilliseconds: (strA) => {
        var str = strA + '';
        var gegex = /^((\d+)h)?((\d+)m)?((\d+)s)?((\d+)ms)?$/gi;
        var matches = gegex.exec(str);
        if (matches && matches.length === 9) {
            var hoursInMillis = (+matches[2] || 0) * 60 * 60 * 1000;
            var minutesInMillis = (+matches[4] || 0) * 60 * 1000;
            var secondsInMillis = (+matches[6] || 0) * 1000;
            var totalMillis = hoursInMillis + minutesInMillis + secondsInMillis + (+matches[8] || 0)
            return totalMillis;
        }

        var gegex2 = /\d+/gi;
        var match = gegex2.exec(str);
        if (match) {
            return Number(match[0]);
        }

        return 0;
    }
}