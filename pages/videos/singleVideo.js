import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { bindActionCreators } from 'redux';
import withRedux from 'next-redux-wrapper';
import moment from 'moment';

import HeadWrapper from '../../components/tags/HeadWrapper/HeadWrapper';
import MainLayoutContainer from '../../containers/layouts/MainLayout/MainLayoutContainer';
import YoutubeVideoCard from '../../components/cards/YoutubeVideoCard/YoutubeVideoCard';
import { initStore } from '../../store/initStore';
import * as videoAction from '../../actions/video';
import * as videoApi from '../../apis/video';

import stylesheet from './singleVideo.scss';

// localStorage.setItem('state', 'off');
class SingleVideo extends React.Component {
  static async getInitialProps({ query, store }) {
    const videoResult = await videoApi.getVideo(query.videoId);
    const video = videoResult.data;
    store.dispatch(videoAction.getVideo(video));


    const randomSameCategoryVideosQuery = {
      category: video.category,
      count: 5,
      random: true,
    };

    const randomSameCategoryVideosResult = await videoApi.getAllVideos(randomSameCategoryVideosQuery);
    const randomSameCategoryVideos = randomSameCategoryVideosResult.datas;


    return {
      randomSameCategoryVideos,
      query,
    };
  }

  constructor(props) {
    super(props);
  }

  componentWillMount() {}

  componentDidMount() {
  }

  componentWillReceiveProps(newProps) {
  }

// <div class="g-ytsubscribe" data-channel="GoogleDevelopers" data-layout="full" data-count="default"></div>
  render() {
    const videoInfo = this.props.video.video;
    const browserAttribute = this.props.browserAttribute;
    const randomSameCategoryVideos = this.props.randomSameCategoryVideos;
    const i18nWords = this.props.i18n.words;

    return (
      <div>
        <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
        <HeadWrapper
          title={'Youtuber看門狗-' + videoInfo.title}
          description={videoInfo.description}
          type={'website'}
          image={videoInfo.highThumbnails}
          url={'https://www.youtuberspy.com/videos/singleVideo?videoId=' + this.props.query.videoId} 
          site_name={'Youtuber看門狗-在這裡發掘您喜歡的Youtubers！'}
          fb_app_id={'158925374651334'}
        />
        <MainLayoutContainer>
          <div className={'SingleVideo-zone'}>
            <h1 className={'SingleVideo-title'}>{videoInfo.title}</h1>
            <div className={'SingleVideo-playVideoZone'}>
              <iframe
                frameBorder="0" allowFullScreen
                width={browserAttribute.windowWidth < 800 ? browserAttribute.windowWidth : 800}
                height={browserAttribute.windowWidth < 800 ? browserAttribute.windowWidth * 4.5 / 8 : 450}
                src={'https://www.youtube.com/embed/' + videoInfo._id}>
              </iframe>
            </div>
            <Link href={'/channels/singleChannel?channelId=' + videoInfo.channelId}><a>
              <h2 className={'SingleVideo-smallTitle'}>
                {videoInfo.channelTitle}
              </h2>
            </a></Link>
            <h2 className={'SingleVideo-smallTitle'}>
              {i18nWords.videoCategory[videoInfo.category] || videoInfo.category}
            </h2>
            <div className={'SingleVideo-statisticZone'}>
              <div className={'SingleVideo-statistic'}>
                <span>觀看 {videoInfo.viewCount.toLocaleString()}</span>
              </div>
              <div className={'SingleVideo-statistic'}>
                <span>時間 {moment(new Date(videoInfo.publishedAt)).format('YYYY-MM-DD')}</span>
              </div>
              <div className={'SingleVideo-statistic'}>
                <span>喜歡 {videoInfo.likeCount.toLocaleString()}</span>
              </div>
              <div className={'SingleVideo-statistic'}>
                <span>不喜歡 {videoInfo.dislikeCount.toLocaleString()}</span>
              </div>
            </div>
            <p className={'SingleVideo-description'}>{videoInfo.description || '這個影片沒有任何的介紹'}</p>
            <h1 className={'SingleVideo-zoneTitle'}>相同類型影片</h1>
            <div className={'SingleVideo-videosZone'}>
              {
                randomSameCategoryVideos.length === 0 ?
                  <h3 className={'SingleVideo-noDatasText'}>由於此頻道最近新增，目前沒有熱門影片數據</h3>
                  :
                  randomSameCategoryVideos.map((item) => {
                    return (
                      <YoutubeVideoCard
                        key={item._id}
                        videoInfo={item}
                      />
                    );
                  })
              }
            </div>
          </div>
        </MainLayoutContainer>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    video: state.video,
    i18n: state.i18n,
    browserAttribute: state.browserAttribute,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    // getVideosAsync: bindActionCreators(videoAction.getVideosAsync, dispatch),
  }
}

export default withRedux(initStore, mapStateToProps, mapDispatchToProps)(SingleVideo);
