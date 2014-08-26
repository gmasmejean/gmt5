/* New Draft */

var options = {
    view:'', // years, months, days, hours, minutes
    min_view:'',
    max_view:'',
    hour_mode:'',
    
    min_date:undefined,
    max_date:undefined,
    
    format:'',
    days:[],
    months:[],
    utc: false
    
};





var gmt5 = {
    format_rgx:function(){ return gmt5.esc+'M, '+gmt5.esc+'j'+gmt5.esc+'S '+gmt5.esc+'Y';}, // '#M #j#S #Y'
    days:['sunday','monday','tuesday','wednesday','thursday','friday','saturday'],
    months:['january','february','march','april','may','june','july','august','september','october','november','december'],
    s:['st','nd','rd','th'],
    esc:'$',
    formats:{
        d:function(d){ var s=d.getDate(); return s<10?'0'+s:''+s; }, // day of month: 01 to 31.
        D:function(d){ return gmt5.days[d.getDay()].slice(0,3); }, // day of week, 3 chars: "mon" to "sun".
        j:function(d){ return d.getDate(); }, // day of month without zero: 1 to 31.
        l:function(d){ return gmt5.days[d.getDay()]; }, // day of week: "monday" to "sunday".
        N:function(d){ return d.getDay()?d.getDay():7; }, // ISO-8601 day representation ( 1 for monday => 7 for sunday )
        S:function(d){ var s=d.getDate(); return gmt5.s[s<4?s-1:3]; }, // day suffix: "st","nd","rd","th".
        w:function(d){ return d.getDay(); }, // day of the week from 0 (sunday) to 6 (saturday)
        z:function(d){ var s=new Date(d); s.setMonth(0); s.setDate(1); return 1+(d-s)/86400000; }, // day of year 0 -> 365.
        W:function(d){ var s=new Date(d.getFullYear(),0,1); 
            return 1+Math.floor((d.getTime()-s.setTime(s.getTime()-(s.getDay()?s.getDay()-1:6)*86400000))/(7*86400000)); }, // Year week number. ISO-8601. week start monday.
        F:function(d){ return gmt5.months[d.getMonth()]; }, // month: "january" to "december".
        m:function(d){ var s=d.getMonth()+1; return s<10?'0'+s:''+s; }, // month: 01 to 31.
        M:function(d){ return gmt5.months[d.getMonth()].slice(0,3); }, // month, 3chars: "jan" to "dec".
        n:function(d){ return d.getMonth()+1; }, // month without zero: 1 to 12.
        t:function(d){ var b=new Date(d); return -(b.setDate(1)-b.setMonth(d.getMonth()+1))/86400000; }, // return number of days in date month.
        L:function(d){ var y=d.getFullYear(); return (y%4===0 && y%100!==0) || y%400===0?1:0;}, // Leap year: Yes(1) / No(0)
        Y:function(d){ return d.getFullYear(); }, // Year, 4 numbers: 2014.
        y:function(d){ return (d.getFullYear()+'').slice(2); }, // Year, 2 numbers: 2014-> "14".
        a:function(d){ return d.getHours()<12?'am':'pm';}, // Ante meridiem or Post meridiem "am" / "pm"
        A:function(d){ return (d.getHours()<12?'AM':'PM');}, // Ante meridiem or Post meridiem "AM" / "PM"
        g:function(d){ return d.getHours()%12?d.getHours()%12:'12'; }, // Hours in twelve hours format 1 -> 12.
        G:function(d){ return d.getHours(); }, // Hours in twenty four format:  0 -> 23.
        h:function(d){ return d.getHours()%12?('0'+(d.getHours()%12)).slice(-2):'12'; }, // Hours in twelve hours format: "01" -> "12".
        H:function(d){ return ('0'+d.getHours()).slice(-2); }, // Hours in twenty four hours format: "00" -> "23".
        i:function(d){ return ('0'+d.getMinutes()).slice(-2); }, // Minutes with initial zero: "00" -> "59".
        s:function(d){ return ('0'+d.getSeconds()).slice(-2); }, // Seconds with initial zero: "00" -> "59".
        O:function(d){ var o=d.getTimezoneOffset(); 
            return (o<0?'+':'-')+('0'+Math.floor(o/60)).slice(-2)+('0'+o%60).slice(-2); }, // Difference with GMT hour ( +0200 )
        P:function(d){ var o=d.getTimezoneOffset(); 
            return (o<0?'+':'-')+('0'+Math.abs(Math.floor(o/60))).slice(-2)+':'+('0'+Math.abs(o%60)).slice(-2); }, // Difference with GMT hour ( +02:00 )
        c:function(d){ return d.toISOString(); }, // Date in ISO-8601 format
        U:function(d){ return Math.floor(d.UTC()/1000); } // Unix seconds since 01/01/1970 00:00:00 GMT.
    },
    format:function( date, format ){
        var s = format||gmt5.format_rgx(), d = date;
        if( !d )
            d = new Date();
        else if( typeof(d) === 'string' )
            d = new Date(d);
        if( d instanceof Date && d.getTime() ){
            var rgx = new RegExp(gmt5.esc+'['+Object.keys(gmt5.formats).join('')+']','g');
            var match = s.match(rgx);
            for( var i=0; i< match.length; i++ )
                if( gmt5.formats[match[i].slice(gmt5.esc.length)] )
                    s = s.replace( match[i], gmt5.formats[match[i].slice(gmt5.esc.length)](d) );
            return s;
        }else
            return date||'';
    }
};
