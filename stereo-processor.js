class StereoProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.leftChannelData = [];
    this.rightChannelData = [];
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    
    // 调试：检查输入数据
    if (input && input.length > 0) {
      console.log('AudioWorklet收到输入:', {
        inputLength: input.length,
        channel0Length: input[0] ? input[0].length : 0,
        channel1Length: input[1] ? input[1].length : 0,
        hasData: input[0] && input[0].length > 0
      });
    }
    
    if (input.length >= 2) {
      // 立体声输入：分离左右声道
      const leftInput = input[0];
      const rightInput = input[1];
      
      // 将左右声道数据发送到主线程
      this.port.postMessage({
        type: 'stereoData',
        leftChannel: leftInput.slice(),
        rightChannel: rightInput.slice(),
        sampleRate: sampleRate
      });
      
      // 输出处理后的数据（这里只是传递原始数据）
      if (output.length >= 2) {
        output[0].set(leftInput);
        output[1].set(rightInput);
      }
    } else if (input.length === 1) {
      // 单声道输入：复制到左右声道
      const monoInput = input[0];
      
      this.port.postMessage({
        type: 'monoData',
        data: monoInput.slice(),
        sampleRate: sampleRate
      });
      
      if (output.length >= 2) {
        output[0].set(monoInput);
        output[1].set(monoInput);
      }
    }
    
    return true;
  }
}

registerProcessor('stereo-processor', StereoProcessor); 