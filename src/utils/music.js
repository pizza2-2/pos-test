// music.js
var music = {
    play_didi() {
        const innerAudioContext = uni.createInnerAudioContext();
        innerAudioContext.autoplay = true;
        innerAudioContext.src = '/static/didi.mp3';
        innerAudioContext.onPlay(() => {
            console.log('开始播放');
        });
        innerAudioContext.onError((res) => {
            console.log('播放错误');
            console.log(res.errMsg);
            console.log(res.errCode);
        });
    }
}

// 改为 ES6 导出
export default music;