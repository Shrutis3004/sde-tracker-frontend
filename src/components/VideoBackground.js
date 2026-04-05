import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

const loginVideo = require('../../assets/login-bg-video.mp4');

export default function VideoBackground({ videoUrl, overlayColor = '#000000B0' }) {
  if (Platform.OS === 'web') {
    return <WebVideo videoUrl={videoUrl} overlayColor={overlayColor} />;
  }
  return <NativeVideo overlayColor={overlayColor} />;
}

// Web: use DOM video element
function WebVideo({ videoUrl, overlayColor }) {
  const idRef = React.useRef('video-bg-' + Math.random().toString(36).slice(2, 8));

  React.useEffect(() => {
    const id = idRef.current;
    const container = document.getElementById(id);
    if (!container) return;

    const video = document.createElement('video');
    video.src = videoUrl || '/assets/assets/login-bg-video.mp4';
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    Object.assign(video.style, {
      position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', objectFit: 'cover',
    });
    container.prepend(video);
    video.play().catch(() => {});

    let overlay;
    if (overlayColor && overlayColor !== 'transparent') {
      overlay = document.createElement('div');
      Object.assign(overlay.style, {
        position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
        backgroundColor: overlayColor, pointerEvents: 'none',
      });
      container.appendChild(overlay);
    }

    return () => {
      video.remove();
      if (overlay) overlay.remove();
    };
  }, [videoUrl, overlayColor]);

  return <View style={StyleSheet.absoluteFill} nativeID={idRef.current} />;
}

// Native: use expo-video
function NativeVideo({ overlayColor }) {
  try {
    const { useVideoPlayer, VideoView } = require('expo-video');
    const player = useVideoPlayer(loginVideo, (p) => {
      p.loop = true;
      p.muted = true;
      p.play();
    });

    return (
      <View style={StyleSheet.absoluteFill}>
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          nativeControls={false}
          contentFit="cover"
          allowsFullscreen={false}
          allowsPictureInPicture={false}
        />
        {overlayColor && overlayColor !== 'transparent' && (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: overlayColor }]} />
        )}
      </View>
    );
  } catch (e) {
    // Fallback if expo-video not available
    return overlayColor && overlayColor !== 'transparent'
      ? <View style={[StyleSheet.absoluteFill, { backgroundColor: overlayColor }]} />
      : <View style={[StyleSheet.absoluteFill, { backgroundColor: '#121219' }]} />;
  }
}
