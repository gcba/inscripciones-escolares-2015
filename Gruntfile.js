'use strict';
module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        sass: {
            dist: {
                files: {
                    'css/base.css': 'css/base.scss',
                    'css/estilosMapaInteractivo.css': 'css/estilosMapaInteractivo.scss'
                }
            }
        },
        watch: {
            css: {
                files: '**/*.scss',
                tasks: ['sass','beep:2']
            },
            options: {
                livereload: true
            }
        },
        cssmin: {
            target:{
                files:{
                'css/base.min.css': 'css/base.css',
                'css/estilosMapaInteractivo.min.css': 'css/estilosMapaInteractivo.css'
                }
            }
        },

        uglify: {
            dist: {
              files: {
                'js/mapaInteractivo.min.js': 'js/mapaInteractivo.js',
                'js/filtros.min.js': 'js/filtros.js',
                'js/mapa_de_caba.min.js': 'js/mapa_de_caba.js',
                'js/viz_educacion.min.js': 'js/viz_educacion.js',
                'js/global_settings.min.js': 'js/global_settings.js'
              }
            }
        }

    });


    //Register modules to user
    grunt.loadNpmTasks('grunt-beep');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    //Register tasks
    grunt.registerTask('default', ['watch']);
    grunt.registerTask('deploy', ['cssmin', 'uglify']);
};