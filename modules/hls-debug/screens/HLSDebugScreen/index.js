import React, { useState, useRef, useMemo } from 'react'
import { View, Text, TextInput, Dimensions, TouchableOpacity, ScrollView } from 'react-native'
import Video from 'react-native-video'

const playerWidth = Dimensions.get('window').width
const playerHeight = (playerWidth / 16) * 9
const defaultUri = 'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8'

const HLSDebugScreen = () => {
  const [textInput, setTextInput] = useState(defaultUri)
  const [uri, setUri] = useState(defaultUri)
  const [pause, setPause] = useState(false)
  const [logs, setLogs] = useState([])
  const [currentResolution, setCurrentResolution] = useState('')
  const [currentBitrate, setCurrentBitrate] = useState('')
  const [availableResolutions, setAvailableResolutions] = useState([])

  const playerRef = useRef()

  const onLoadStart = () => {
    setLogs(state => [`Attempting to fetch video from: ${uri}`, ...state])
  }
  const onLoad = (data) => {
    const videoResolutions = data.videoTracks.map(track => (`${track.height}`))
    setLogs(state => ['Success loading video', ...state])
    setAvailableResolutions(videoResolutions)
  }

  const onBuffer = (buffer) => {
    if (buffer) {
      setLogs(state => ['Buffering...', ...state])
    }
  }

  const onError = () => {
    setLogs(state => ['Unable to fetch video...', ...state])
  }

  const onBandwidthUpdate = (data) => {
    const bitrate = data.bitrate
    const resolution = data.height
    if (resolution !== currentResolution) {
      setCurrentResolution(resolution)
    }

    if (bitrate !== currentBitrate) {
      setCurrentBitrate(bitrate)
    }
  }

  const onPlayPressed = () => {
    if (textInput !== uri) {
      setUri(textInput)
      setCurrentResolution('')
      setCurrentBitrate('')
      setLogs(state => [`Parsing new uri: ${uri}`, ...state])
    } else {
      setLogs(state => ['Replaying video...', ...state])
      playerRef.current.seek(1)
      setPause(false)
    }
  }

  const onClearLogPressed = () => {
    setLogs([])
  }

  const renderLogs = useMemo(() => logs.map(log => (
    <View key={Math.random()} style={{ marginBottom: 10 }}>
      <Text>
        {log}
      </Text>
    </View>
  )), [logs])

  const renderAvailableResolutions = useMemo(() => availableResolutions.map((reso, index) => (
    <Text key={Math.random()}>
      {reso}
      {'p'}
      {index === availableResolutions.length - 1 ? '' : ', '}
    </Text>
  )), [availableResolutions])

  return (
    <View style={{ flex: 1 }}>
      <Video
        source={{ uri }}
        ref={playerRef}
        controls
        onLoadStart={onLoadStart}
        onLoad={onLoad}
        onBuffer={onBuffer}
        onError={onError}
        onBandwidthUpdate={onBandwidthUpdate}
        onSubmitEditing={onPlayPressed}
        reportBandwidth
        paused={pause}
        style={{
          width: playerWidth,
          height: playerHeight
        }}
      />
      <View style={{ padding: 10 }}>
        <TextInput
          placeholder="Enter HLS URL"
          onChangeText={text => setTextInput(text)}
          value={textInput}
          style={{ borderBottomWidth: 0.5 }}
        />
      </View>
      <View style={{ paddingBottom: 20, flexDirection: 'row', borderBottomWidth: 0.5 }}>
        <TouchableOpacity
          style={{
            borderWidth: 0.5,
            borderRadius: 10,
            padding: 10,
            width: playerWidth - 20,
            marginHorizontal: 10,
            alignItems: 'center'
          }}
          onPress={onPlayPressed}
        >
          <Text>{textInput === uri ? 'Replay' : 'Load New Video from URI'}</Text>
        </TouchableOpacity>
      </View>
      <View style={{ padding: 10 }}>
        <Text style={{ color: 'black' }}>
          Available Resolutions:
          {' '}
          {renderAvailableResolutions}
        </Text>
        <Text style={{ color: 'black' }}>
          Current Bitrate:
          {' '}
          {currentBitrate.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          {' '}
          bits/s
        </Text>
        <Text style={{ color: 'black' }}>
          Current Resolution:
          {' '}
          {currentResolution}
          p
        </Text>
      </View>
      <View style={{ width: '100%', padding: 10, backgroundColor: 'black', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontWeight: 'bold', color: 'white' }}>
          DEBUG LOG
        </Text>
        <TouchableOpacity onPress={onClearLogPressed}>
          <Text style={{ fontWeight: 'bold', color: 'white' }}>
            CLEAR LOG
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 10 }}
      >
        {renderLogs}
      </ScrollView>
    </View>
  )
}

export default HLSDebugScreen
