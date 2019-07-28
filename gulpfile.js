//引入模块
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var babel = require("gulp-babel"); 
var clean = require('gulp-clean');  

//定义清理任务
gulp.task('clean', function() {
    //clean dist文件夹
    return gulp.src('dist', { read: false })
        .pipe(clean());
})

// ES6转化为ES5
// 在命令行使用 gulp toes5 启动此任务
gulp.task("toes5",function () {
     gulp.src(["wfui/**/*.js","!wfui/plugins/**/*.js"])
     // ES6 源码存放的路径
      .pipe(babel())
      .pipe(gulp.dest("dist/wfui/")); //转换成 ES5 存放的路径
 
  });
  

//定义压缩任务
gulp.task('compress', function() {

    //将js文件下的js文件压缩后放到dist/js下
    return gulp.src('dist/wfui/**/*.js')
        .pipe(uglify({
            mangle: true
        }))
        .pipe(gulp.dest('dist/wfui/'));
})

gulp.task('default', ['clean','toes5'], function()  {

})
