module.exports = function (grunt) {
    
    grunt.initConfig({
        
        copy: {
            requirejs: {
                src: 'bower_components/requirejs/require.js',
                dest: 'dist/js/require.js'
            },
            openSansFonts: {
                src: ['**'],
                dest: 'dist/fonts/open-sans/',
                cwd: 'bower_components/open-sans-fontface/fonts/',
                expand: true
            },
            ioniconsFonts: {
                src: ['**'],
                dest: 'dist/fonts/ionicons/',
                cwd: 'bower_components/ionicons/fonts/',
                expand: true
            },
            desktopImages: {
            	src: ['**'],
            	dest: 'dist/img/',
            	cwd: 'desktop/img/',
            	expand: true
            },
            mobileImages: {
            	src: ['**'],
            	dest: 'dist/img/',
            	cwd: 'mobile/img/',
            	expand: true
            }
        },
        
        sass: {
            desktop: {
                options: {
                    style: 'compressed'
                },
                files: {
                    'dist/css/main.desktop.css': 'desktop/scss/main.scss'
                }
            },
            mobile: {
                options: {
                    style: 'compressed'
                },
                files: {
                    'dist/css/main.mobile.css': 'mobile/scss/main.scss'
                }
            }
        },
        
        jst: {
            desktop: {
                options: {
                    amd: true,
                    processName: function (filepath) {
                        return filepath.replace('desktop/templates/', '').replace('.html', '');
                    }
                },
                files: {
                    'desktop/js/src/templates.js': ['desktop/templates/**/*.html']
                }
            },
            mobile: {
                options: {
                    amd: true,
                    processName: function (filepath) {
                        return filepath.replace('mobile/templates/', '').replace('.html', '');
                    }
                },
                files: {
                    'mobile/js/src/templates.js': ['mobile/templates/**/*.html']
                }
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-jst');
    
    grunt.registerTask('default', ['copy', 'sass', 'jst']);
};