import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { bindActionCreators } from 'redux';
import withRedux from 'next-redux-wrapper';
import moment from 'moment';

import HeadWrapper from '../../components/tags/HeadWrapper/HeadWrapper';
import MainLayoutContainer from '../../containers/layouts/MainLayout/MainLayoutContainer';
import YoutubeVideoCard from '../../components/cards/YoutubeVideoCard/YoutubeVideoCard';
import ReactHighcharts from 'react-highcharts';
import { initStore } from '../../store/initStore';
import * as channelAction from '../../actions/channel';
import * as channelStatisticAction from '../../actions/channelStatistic';
import * as channelApi from '../../apis/channel';
import * as videoApi from '../../apis/video';
import * as channelStatisticApi from '../../apis/channelStatistic';

import stylesheet from './singleChannel.scss';

// localStorage.setItem('state', 'off');
class SingleChannel extends React.Component {
  static async getInitialProps({ query, store }) {
    const videoQueryNewest = {
      page: 1,
      count: 15,
      sort: 'publishedAt',
      channelId: query.channelId,
    };
    const videoQueryHottest = {
      page: 1,
      count: 15,
      sort: 'viewCount',
      channelId: query.channelId,
    };

    const results = await Promise.all([
      channelApi.getChannel(query.channelId),
      videoApi.getAllVideos(videoQueryNewest),
      videoApi.getAllVideos(videoQueryHottest)
    ]);
    const channelResult = results[0];
    store.dispatch(channelAction.getChannel(channelResult.data, channelResult.token));

    const videoNewestResult = results[1];
    const videoHottestResult = results[2];

    return {
      hottestVideos: videoHottestResult.datas,
      newestVideos: videoNewestResult.datas,
      query,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
    };
    this.generateDailyChartConfig = this.generateDailyChartConfig.bind(this);
  }

  componentWillMount() {}

  componentDidMount() {
    const fullSiteUrl = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '') + '/';
    // console.log(fullSiteUrl, window.location.href);
    this.props.getChannelStatisticsAsync({
      page: 1,
      count: 30,
      sort: 'createdAt',
      channelId: this.props.query.channelId,
    });
  }

  componentWillReceiveProps(newProps) {
  }

  /* Get the data differences, if you want 7 result, you need 8 datas */
  generateDailyChartConfig(datas, title, xAxisParam, yAxisParam, count) {
    const targetDatas = datas.slice(0, count + 1);
    const xAxis = [];
    const yAxis = [];
    const neededDatasSize = targetDatas.length - 1;

    for (let i = 0; i < neededDatasSize; i++) {
      let xAxisValue = targetDatas[i + 1][xAxisParam];
      if (xAxisParam === 'date') {
        xAxisValue = moment(new Date(xAxisValue)).format('MM-DD');
      }
      xAxis.unshift(xAxisValue);
      yAxis.unshift(targetDatas[i][yAxisParam] - targetDatas[i + 1][yAxisParam]);
    }

    return {
      title: {
        text: title,
      },
      xAxis: {
        categories: xAxis,
      },
      series: [
        {
          name: title,
          data: yAxis,
        }
      ]
    };
  }

// <div class="g-ytsubscribe" data-channel="GoogleDevelopers" data-layout="full" data-count="default"></div>
  render() {
    const channelInfo = this.props.channel.channel;
    const hottestVideos = this.props.hottestVideos;
    const newestVideos = this.props.newestVideos;
    const channelStatistics = this.props.channelStatistic.channelStatistics;
    const viewCountsChartConfig = this.generateDailyChartConfig(channelStatistics, '每日觀看數', 'date', 'viewCount', 10);
    const subscriberCountsChartConfig = this.generateDailyChartConfig(channelStatistics, '新增訂閱數', 'date', 'subscriberCount', 10);
    const socialInfos = channelInfo.socialInfos || [];
    const i18nWords = this.props.i18n.words;

    return (
      <div>
        <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
        <HeadWrapper
          title={'Youtuber看門狗-' + channelInfo.title}
          description={channelInfo.description}
          type={'website'}
          image={channelInfo.bannerTvImageUrl}
          url={'https://www.youtuberspy.com/channels/singleChannel?channelId=' + this.props.query.channelId}
          site_name={'Youtuber看門狗-在這裡發掘您喜歡的Youtubers！'}
          fb_app_id={'158925374651334'}
        />
        <Head>
          <script src='https://apis.google.com/js/platform.js'></script>
        </Head>
        <MainLayoutContainer>
          <div className={'SingleChannel-zone'}>
            <div className={'SingleChannel-titleZone'}>
              <figure className={'SingleChannel-backgroundImage'}>
                <img src={channelInfo.bannerTvImageUrl}/>
              </figure>
              <figure className={'SingleChannel-photoImage'}>
                <img src={channelInfo.defaultThumbnails}/>
              </figure>
              <div className={'SingleChannel-decorateZone'}>
              </div>
              <span className={'SingleChannel-countryName'}>
                {channelInfo.country}
              </span>
              <div className={'SingleChannel-subscriber'} dangerouslySetInnerHTML={{__html: `
                  <div
                    class='g-ytsubscribe'
                    data-channelid=${channelInfo._id} data-layout='default' data-count='default'>
                  </div>
                `}}
              />
            </div>
            <h1 className={'SingleChannel-title'}>{channelInfo.title}</h1>
            <h2 className={'SingleChannel-smallTitle'}>{i18nWords.channelCategory[channelInfo.category] || ''}</h2>
            <div className={'SingleChannel-statisticZone'}>
              <div className={'SingleChannel-statistic'}>
                <span>訂閱 {channelInfo.subscriberCount.toLocaleString()}</span>
              </div>
              <div className={'SingleChannel-statistic'}>
                <span>觀看 {channelInfo.viewCount.toLocaleString()}</span>
              </div>
              <div className={'SingleChannel-statistic'}>
                <span>影片 {channelInfo.videoCount.toLocaleString()}</span>
              </div>
              <div className={'SingleChannel-statistic'}>
                <span>評論 {channelInfo.commentCount.toLocaleString()}</span>
              </div>
            </div>
            <p className={'SingleChannel-description'}>{channelInfo.description || '這個頻道沒有任何的介紹'}</p>
            <div className={'SingleChannel-socialListZone'}>
              {
                socialInfos.map((socialInfo, index) => {
                  return (
                    <div key={index} className={'SingleChannel-socialList'}>
                      <a target="_blank" href={socialInfo.href}>
                        <img className={'SingleChannel-socialIcon'} src={socialInfo.img} />
                        <span className={'SingleChannel-socialTitle'}>{socialInfo.title}</span>
                      </a>
                    </div>
                  );
                })
              }
            </div>
            <h1 className={'SingleChannel-zoneTitle'}>頻道數據</h1>
            {viewCountsChartConfig.series[0].data.length === 0 ?
                <h3 className={'SingleChannel-noDatasText'}>由於此頻道最近新增，目前沒有歷史觀看數據</h3>
                :
                <ReactHighcharts
                  config={viewCountsChartConfig}
                />
            }
            {viewCountsChartConfig.series[0].data.length === 0 ?
                <h3 className={'SingleChannel-noDatasText'}>由於此頻道最近新增，目前沒有歷史訂閱數據</h3>
                :
                <ReactHighcharts
                  config={subscriberCountsChartConfig}
                />
            }
            <h1 className={'SingleChannel-zoneTitle'}>最新影片</h1>
            <div className={'SingleChannel-videosZone'}>
              {
                newestVideos.length === 0 ?
                  <h3 className={'SingleChannel-noDatasText'}>由於此頻道最近新增，目前沒有最新影片數據</h3>
                  :
                  newestVideos.map((item) => {
                    return (
                      <YoutubeVideoCard
                        key={item._id}
                        videoInfo={item}
                      />
                    );
                  })
              }
            </div>
            <h1 className={'SingleChannel-zoneTitle'}>熱門影片</h1>
            <div className={'SingleChannel-videosZone'}>
              {
                hottestVideos.length === 0 ?
                  <h3 className={'SingleChannel-noDatasText'}>由於此頻道最近新增，目前沒有熱門影片數據</h3>
                  :
                  hottestVideos.map((item) => {
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
    // video: state.video,
    channelStatistic: state.channelStatistic,
    channel: state.channel,
    i18n: state.i18n,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getChannelAsync: bindActionCreators(channelAction.getChannelAsync, dispatch),
    getChannelStatisticsAsync: bindActionCreators(channelStatisticAction.getChannelStatisticsAsync, dispatch),
    // getVideosAsync: bindActionCreators(videoAction.getVideosAsync, dispatch),
  }
}

export default withRedux(initStore, mapStateToProps, mapDispatchToProps)(SingleChannel);
