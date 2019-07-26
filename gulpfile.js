/**
 * Automatisierung des Installprozesses fuer WebChat
 * Hier werden folgende Dinge nach der Installation der NPM-Packete durchgefuehrt:
 * 
 *      - microsoft-credentials.js wird als leere Datei in credentials erzeugt
 */

'use strict';


// Module definieren

const gulp = require('gulp');
const fs = require('fs');
const file = require('gulp-file');
const inject = require('gulp-inject-string');
const runSequence = require('run-sequence');



const credentialsDir = 'credentials';


// Erzeuge-Funktionen


/**
 * Erzeugt microsoft-credentials.js in credentials/
 */

gulp.task('install-microsoft-credentials-js', function() {
    try {
        // pruefen auf vorhandene Microsoft-Credentials Datei
        fs.accessSync( `${credentialsDir}/microsoft-credentials.js` );
    } catch (e) {
        // Datei ist nicht vorhanden und kann erzeugt werden
        return gulp.src([ `${credentialsDir}/microsoft-credentials.js` ])
            .pipe( file( 'microsoft-credentials.js', ''))
            .pipe(inject.append( "/**\n" ))
            .pipe(inject.append( " * Microsoft Credentials\n" ))
            .pipe(inject.append( " */\n" ))
            .pipe(inject.append( "\n" ))
            .pipe(inject.append( "\n" ))
            .pipe(inject.append( "export const MICROSOFT_REGION = '';\n" ))
            .pipe(inject.append( "export const MICROSOFT_SUBSCRIPTION_KEY = '';\n" ))
            .pipe( gulp.dest(  credentialsDir ));
    }
    return gulp.src( '' ); // empty stream
});



/**
 * Installiert alle benoetigten Dateien
 */

gulp.task('install', (callback) => {
    runSequence(
        'install-microsoft-credentials-js',
        callback
    );
});

