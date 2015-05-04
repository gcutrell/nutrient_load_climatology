/**
 * Created by tslawecki on 3/8/2015.
 */

// ////
// main


function main() {


    var row;
    var testIn = new Array();

    for (i = 0; i < dailyData.length; i++) {
        row = [new Date(Date.parse(dailyData[i][0])), dailyData[i][1]]
        testIn[i] = row;
    }

    var stats = generateStats(testIn, 1, 1, true);
    return null;
}

// \\\\\\\\\\\\\\\\\\\\\\\\\
// dayNo returns day of year

function dayNo(y, m, d) {
    return --m * 31 - (m > 1 ? (1054267675 >> m * 3 - 6 & 7) - (y & 3 || !(y % 25) && y & 15 ? 0 : 1) : 0) + d;
}

// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// dayNo2 uses dayNo to work on a Date object

function dayNo2(date) {
    return dayNo(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// generateStats returns min, 25%ile, mean, 75%ile, and max for each period
//
//  dailyIn contains a gapless daily time series with date and value
//  aggPeriod = 1, 7 (weekly), or 31 (monthly)
//  startDay = Julian day of year to start on
//  isCumulative = true (calculate cumulative values) or false (use values as passed)

function generateStats(dailyIn, aggPeriod, startDay, isCumulative) {

    // Trim to record containing max number of 365-day years
    // -- find first record with dayNo = startDay

    var first = 0;
    while (dayNo2(dailyIn[first][0]) != startDay) {
        first++;
    }

    // -- Find last record with dayNo = startDay-1

    var endDay = (startDay == 1) ? 365 : startDay - 1;
    var last = dailyIn.length - 1;
    while (dayNo2(dailyIn[last][0]) != endDay) {
        last--;
    }

    var years = Math.floor((last - first) / 365);
    var bins;
    var aggFirst;
    var aggLast;


    // Aggregate

    var interim1 = new Array();
    if (aggPeriod == 1) {
        interim1 = dailyIn.slice(0);
        bins = 365;
        aggFirst = first;
        aggLast = last;

    } else if (aggPeriod == 7) {
        // -- Handle weekly here

        bins = 52;
    } else if (aggPeriod == 30) {
        // -- Handle monthly here
        bins = 12;
    } else {
        console.log("Aggregation period not 1, 7 or 30! (value is " + aggPeriod + ")");
        return null;
    }

    // Initialize bins x years array for storing sorted values

    var interim2 = new Array(bins);
    for (i = 0; i < bins; i++) {
        interim2[i] = new Array(years);
    }

    // Bin data

    var currentYear = -1;
    var currentBin;

    switch (aggPeriod) {

        case 1: // Daily

            for (i = aggFirst; i <= aggLast; i++) {
                if (dayNo2(interim1[i][0]) == startDay) {
                    currentYear++;
                    currentBin = 0;
                    interim2[currentBin][currentYear] = interim1[i][1];
                } else {
                    currentBin++;
                    if (currentBin < bins) {
                        interim2[currentBin][currentYear] = interim1[i][1] + ((isCumulative) ? interim2[currentBin - 1][currentYear] : 0);
                    }
                }
            }
            break;

        case 7:
            break;

        case 30:
            break;

    }

    // Calculate stats

    var results = new Array(5);
    for (i = 0; i < 5; i++) {
        results[i] = new Array(bins);
    }

    var interim3 = new Array();
    var years4 = Math.floor(years / 4);

    for (i = 0; i < bins; i++) {

        interim3 = interim2[i].sort(function (a, b) {
            return a - b
        });

        results[0][i] = interim3[0];
        results[1][i] = interim3[years4] + (years / 4 - years4) * (interim3[years4 + 1] - interim3[years4]);
        var sum = 0;
        for (j = 0; j < years; j++) {
            sum += interim3[j];
        }
        results[2][i] = sum / years;
        results[3][i] = interim3[years - 1 - years4] +(1- (years / 4 - years4)) * (interim3[years - 2 - years4] - interim3[years - 1 - years4]);
        results[4][i] = interim3[years - 1];
        if (results[3][i] > results[4][i]) {
            results[4][i] = results[4][i];
        }
    }

    // Return stats

    return results;
}

// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// grabAYear returns 365 (or fewer) days of values corresponding to a given year
//
//  dailyIn contains a gapless daily time series with date and value
//  aggPeriod = 1, 7 (weekly), or 31 (monthly)
//  startDay = Julian day of year to start on
//  grabYear is year of startDay to grab
//  isCumulative = true (calculate cumulative values) or false (use values as passed)

function grabAYear(dailyIn, aggPeriod, startDay, grabYear, isCumulative) {

    // Trim to record containing max number of 365-day years
    // Find first date in right year

    var result = null;
    if (grabYear >= dailyIn[0][0].getFullYear()) {

        var first = 0;
        while ((first < dailyIn.length) && (dailyIn[first][0].getFullYear() < grabYear)) {
            var t = dailyIn[first][0].getFullYear();
            first++;
        }
        if (first < dailyIn.length) {

            // -- find first record with dayNo = startDay

            while ((first < dailyIn.length) && (dayNo2(dailyIn[first][0]) != startDay)) {
                first++;
            }

            if (first < dailyIn.length) {

                // -- Find last record with dayNo = startDay-1

                var endDay = (startDay == 1) ? 365 : startDay - 1;
                var last = Math.min(dailyIn.length - 1, first + 364);

                // -- Todo: aggregation

                result = new Array(last - first);
                for (i = 0; i < last - first; i++) {
                    result[i] = dailyIn[i + first][1] + ((i == 0) || !isCumulative ? 0 : result[i - 1])
                }
            }

        }
    }
    return result;
}
