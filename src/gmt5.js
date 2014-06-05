var gmt5 = {
    format_rgx:function(){ return gmt5.esc+'M, '+gmt5.esc+'j'+gmt5.esc+'S '+gmt5.esc+'Y';}, // '#M #j#S #Y'
    days:['sunday','monday','tuesday','wednesday','thursday','friday','saturday'],
    months:['january','february','march','april','may','june','july','august','september','october','november','december'],
    s:['st','nd','rd','th'],
    esc:'#',
    formats:{
        d:function(d){ var s=d.getDate(); return s<10?'0'+s:''+s; }, // day of month: 01 to 31.
        D:function(d){ return gmt5.days[d.getDay()].slice(0,3); }, // day of week, 3 chars: "mon" to "sun".
        j:function(d){ return d.getDate(); }, // day of month without zero: 1 to 31.
        l:function(d){ return gmt5.days[d.getDay()]; }, // day of week: "monday" to "sunday".
        S:function(d){ var s=d.getDate(); return gmt5.s[s<4?s-1:3]; }, // day suffix: "st","nd","rd","th".
        F:function(d){ return gmt5.months[d.getMonth()]; }, // month: "january" to "december".
        m:function(d){ var s=d.getMonth()+1; return s<10?'0'+s:''+s; }, // month: 01 to 31.
        M:function(d){ return gmt5.months[d.getMonth()].slice(0,3); }, // month, 3chars: "jan" to "dec".
        n:function(d){ return d.getMonth()+1; }, // month without zero: 1 to 12.
        Y:function(d){ return d.getFullYear(); }, // Year, 4 numbers: 2014.
        y:function(d){ return (d.getFullYear()+'').slice(2); } // Year, 2 numbers: 14.
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
    },
    formatDOM:function( elts, dateAttr, formatAttr){
        elts.each(function(){
            $(this).html( gmt5.format( $(this).attr(dateAttr), decodeURIComponent( $(this).attr(formatAttr) ) ) );
        });
    },
    ago:{
        run: function( elts, attr ){
            elts.each(function(){
                gmt5.ago.cd( this, attr );
            });
        },
        cd: function( dom, attr ){
            var diff = (new Date()).getTime() - (new Date($(this).attr(attr))).getTime();
            if( diff > 0 && diff < 86400000 ){
                var t = gmt5.ago.process(diff);
                $(dom).html(gmt5.ago.format(t));
                setTimeout(function(){ gmt5.ago.cd(dom); },t.hours?3600000:60000);
            }
        },
        process: function( diff ){
            diff = round( diff/1000 )||0;
            var time = {hours:0,minutes:0,seconds:0};
            time.seconds=diff%60;
            time.minutes=(diff-seconds)%3600/60;
            time.hours=(diff-minutes*60-seconds)/3600;
            return time;
        },
        format:function( time ){
            if( time.hours )
                return gmt5.ago.hours( time.hours);
            else if( time.minutes )
                return gmt5.ago.minutes( time.minutes);
            else if( time.seconds )
                return gmt5.ago.seconds( time.seconds);
        },
        hours: function(h){ return h+' hours ago';},
        minutes: function(m){ return m+' minutes ago';},
        seconds: function(s){ return 'less than a minute ago';}
    },  
    toISO: function( year, month, day, hour, min){
        if( year instanceof Date )
            return year.toISOString();
        else{
            var now = new Date();
            var d = new Date(year||now.getFullYear(),(month||(now.getMonth()+1))-1,day||now.getDate(),hour||0,min||0);
            return d.toISOString();
        }
    },
    picker: function( container, callback, override ){
        $.extend(this,override);
        this.container = container;
        this.container._gmt5 = this;
        this.callback = callback;
        this.init();
    }
};

gmt5.picker.prototype = {
    view: 'years',
    hview: 'h12', // h24
    container: undefined,
    widget: undefined,
    date: undefined,
    hour: undefined,
    vdate: undefined,
    template:   '<div class="gmt5_widget">'+
                    '<div class="gmt5_date"></div><div class="gmt5_hour"></div>'+
                    '<div gmt5-years class="gmt5_mode">'+
                        '<div class="gmt5_head">'+
                            '<div class="gmt5_left" gmt5-slide="left"></div><div class="gmt5_hct"></div><div class="gmt5_right" gmt5-slide="right"></div>'+
                        '</div>'+
                        '<div class="gmt5_ct"></div>'+
                    '</div>'+
                    '<div gmt5-months class="gmt5_mode">'+
                        '<div class="gmt5_head">'+
                            '<div class="gmt5_left" gmt5-slide="left"></div><div class="gmt5_hct" gmt5-view="years"></div><div class="gmt5_right" gmt5-slide="right"></div>'+
                        '</div>'+
                        '<div class="gmt5_ct"></div>'+
                    '</div>'+
                    '<div gmt5-days class="gmt5_mode">'+
                        '<div class="gmt5_head">'+
                            '<div class="gmt5_left" gmt5-slide="left"></div><div class="gmt5_hct" gmt5-view="months"></div><div class="gmt5_right" gmt5-slide="right"></div>'+
                        '</div>'+
                        '<div class="gmt5_days"></div>'+
                        '<div class="gmt5_ct"></div>'+
                    '</div>'+
                    '<div gmt5-hours class="gmt5_mode">'+
                        '<div class="gmt5_head">Set hour</div>'+
                        '<div class="gmt5_ct"></div>'+
                    '</div>'+
                '</div>',
    init:function(){
        // Add method to Date.prototype
        Date.prototype.setGMT5Month = this.setGMT5Month;
        
        if( $(this.container).attr('gmt5-date') ){
            this.date = new Date( $(this.container).attr('gmt5-date') );
            this.hour = this.date.getHours();
            this.fill();
        }
        this.vdate = this.date?new Date( this.date ):new Date();
        
        this.build();
    },
    init_date: function(){
        var d = new Date();
        this.date = new Date(d.getFullYear(),d.getMonth(),d.getDate(),this.hour||0,0,0);
        this.hour = this.date.getHours();
    },
    show: function(){
        this.widget.addClass('on');
        this.docEvt = (new Date()).getTime();
        $(document).on('mousedown.gmt5_'+this.docEvt,(function(){ this.hide(); }).bind(this)); 
    },
    hide: function(){
        this.widget.removeClass('on');
        $(document).off('.gmt5_'+this.docEvt);
    },
    build: function(){        
        this.widget = $(this.template);
        var days = '';
        for( var i=0; i<7; i++)
            days += '<div class="gmt5_day">'+gmt5.days[i].slice(0,2)+'</div>';
        this.widget.find('.gmt5_days').append(days); 
        $(this.container).append(this.widget);
        this[this.hview]();
        this[this.view]( this.vdate );
        this.events();
    },
    h12: function(){
        var hours= '<div class="gmt5_hrow"><div class="gmt5_12h">a.m.</div>';
        for( var i=0; i<12; i++)
            hours +='<div class="h" gmt5-hour="'+i+'">'+('0'+(i?i:'12')).slice(-2)+'</div>';
        hours += '</div><div class="gmt5_hrow"><div class="gmt5_12h">p.m.</div>';
        for( var i=0; i<12; i++)
            hours +='<div class="h" gmt5-hour="'+(i+12)+'">'+('0'+(i?i:'12')).slice(-2)+'</div>';
        this.widget.find('[gmt5-hours] .gmt5_ct').html(hours+'</div>');
    },
    h24: function(){
        var hours='';
        for( var i=0; i<24; i++)
            hours +='<div class="h" gmt5-hour="'+i+'">'+('0'+i).slice(-2)+'</div>';
        this.widget.find('[gmt5-hours] .gmt5_ct').html(hours);
    },
    events: function(){
        var self=this;
        this.widget.on('click','[gmt5-date],[gmt5-slide],[gmt5-view]',function(){
            if( $(this).attr('gmt5-date') ){
                var a = ['setFullYear','setGMT5Month','setDate'],
                    d = $(this).attr('gmt5-date').split('/');
                if( !self.date && d.length == 3 )
                    self.init_date();
                if( self.date ){
                    for( var i=0; i<d.length; i++)
                        self.date[a[i]]( d[i] );
                    self.vdate.setTime( self.date.getTime() );
                    self.update();
                }else{
                    for( var i=0; i<d.length; i++)
                        self.vdate[a[i]]( d[i] );
                }
            }
            if( $(this).attr('gmt5-slide') )
                self.slide( $(this).attr('gmt5-slide')==='left' );
            if( $(this).attr('gmt5-view') ){
                self.view = $(this).attr('gmt5-view'); 
                self[self.view]( self.vdate);
            }
            self.highlights();
        });
        this.widget.on('click','[gmt5-hour]',function(e){
            self.widget.find('.crt[gmt5-hour]').removeClass('crt');
            $(this).addClass('crt');
            self.hour = $(this).attr('gmt5-hour');
            if( self.date )
                self.date.setHours(self.hour);
            self.update();
        });
        
        $(this.container).find('.date, .gmt5_date').on('click',(function(){ 
            this[this.view](this.vdate); this.highlights(); this.show();}).bind(this));
        $(this.container).find('.hour, .gmt5_hour').on('click',(function(){
            this.hours(); this.highlights(); this.show();}).bind(this));
        
        this.widget.on('mousedown',function(e){ e.stopPropagation(); });
    },
    fill: function(){
        if( this.date ){
            $(this.container).attr('gmt5-date',this.date.toISOString());
            $(this.container).find('input.date').val( gmt5.format(this.date) );
        }
        if( this.hour || this.date ){
            var h = this.hour||0;
            if( this.hview === 'h12' )
                $(this.container).find('input.hour').val( ('0'+(!(h%12)?'12':h%12) ).slice(-2)+(h>11?'pm':'am') );
            else
                $(this.container).find('input.hour').val( ('0'+h).slice(-2)+'h' );
        }
    },
    update: function(){
        this.fill();
        if( this.callback )
            this.callback( this.date.toISOString() );
    },
    years: function( date ){        
        var y='', start = date.getFullYear()-(date.getFullYear()%10)-1;
        if( this.widget.find('[gmt5-years]').attr('gmt5-years') != start ){
            for( var i=0; i<12; i++)
                y += '<div class="y'+(!i||i===11?' opq':'')+'" gmt5-view="months" gmt5-date="'+(start+i)+'">'+(start+i)+'</div>';
            this.widget.find('[gmt5-years] .gmt5_ct').html(y);
            this.widget.find('[gmt5-years]').attr('gmt5-years',start)
                .find('.gmt5_hct').html( (start+1)+'-'+(start+10) );
        }
        this.widget.removeClass('hmode').find('.on').removeClass('on');
        this.widget.addClass('dmode').find('[gmt5-years]').addClass('on');
    },
    months: function( date ){
        if( this.widget.find('[gmt5-months]').attr('gmt5-months') != date.getFullYear() ){
            var m='';
            for( var i=0; i<12; i++)   
                m += '<div class="m" gmt5-view="days" gmt5-date="'+date.getFullYear()+'/'+i+'">'+gmt5.months[i].slice(0,3)+'</div>';
            this.widget.find('[gmt5-months] .gmt5_ct').html(m);            
            this.widget.find('[gmt5-months]').attr('gmt5-months',date.getFullYear())
                .find('.gmt5_hct').html( date.getFullYear() );            
        }
        this.widget.removeClass('hmode').find('.on').removeClass('on');
        this.widget.addClass('dmode').find('[gmt5-months]').addClass('on');
    },
    days: function( date ){       
        if( this.widget.find('[gmt5-days]').attr('gmt5-days') !== date.getFullYear()+'/'+date.getMonth() ){
            var d = '', m1 = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0 ),
                start = new Date( m1.getTime() - (7-m1.getDay())*86400000 );
            for( var i=0; i<42; i++){
                d+= '<div class="d'+(start.getMonth()!==date.getMonth()?' opq" gmt5-view="days"':'" ')+
                        'gmt5-date="'+start.getFullYear()+'/'+start.getMonth()+'/'+start.getDate()+'">'+start.getDate()+'</div>';
                start.setTime(start.getTime()+86400000);
            }
            this.widget.find('[gmt5-days] .gmt5_ct').html(d);
            this.widget.find('[gmt5-days]').attr('gmt5-days',date.getFullYear()+'/'+date.getMonth())
                .find('.gmt5_hct').html( gmt5.months[date.getMonth()]+', '+date.getFullYear() );
        }
        this.widget.removeClass('hmode').find('.on').removeClass('on');
        this.widget.addClass('dmode').find('[gmt5-days]').addClass('on');
    },
    hours:function(){
        this.widget.removeClass('dmode').find('.on').removeClass('on');
        this.widget.addClass('hmode').find('[gmt5-hours]').addClass('on');
    },
    highlights: function(){
        if( this.date ){
            this.widget.find('.crt').removeClass('crt');
            this.widget.find('[gmt5-date="'+this.date.getFullYear()+'"],'+
                '[gmt5-date="'+this.date.getFullYear()+'/'+this.date.getMonth()+'"],'+
                '[gmt5-date="'+this.date.getFullYear()+'/'+this.date.getMonth()+'/'+this.date.getDate()+'"]').addClass('crt');
        }
        if( this.hour ){
            this.widget.find('.crt[gmt5-hour]').removeClass('crt');
            this.widget.find('[gmt5-hour="'+this.hour+'"]').addClass('crt');
        }
    },
    slide:function( left ){
        if( this.view === 'days' ){
            this.vdate.setMonth( this.vdate.getMonth()+(left?-1:1) );
            this.days( this.vdate );            
        }
        else if( this.view === 'months' ){
            this.vdate.setFullYear( this.vdate.getFullYear()+(left?-1:1) );
            this.months( this.vdate );
        }else{
            this.vdate.setFullYear( this.vdate.getFullYear()+(left?-10:10) );
            this.years( this.vdate );
        }
    },
    setGMT5Month: function( m ){
        var y = this.getFullYear(),
            mday = ( (new Date(y,parseInt(m)+1,1,0,0,0)).getTime()-(new Date(y,m,1,0,0,0)).getTime() )/86400000;    
        this.setDate( Math.min(mday,this.getDate()) );
        this.setMonth( m );
    }
};