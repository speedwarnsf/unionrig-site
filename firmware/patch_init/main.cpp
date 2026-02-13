#include "daisy_patch_sm.h"
#include "daisysp.h"
#include "chaincraft.h"

using namespace daisy;
using namespace daisysp;
using namespace patch_sm;

static DaisyPatchSM hw;
static cc::ChaincraftEngine engine;

// Example external footswitch wiring (adjust to your actual wiring).
static Switch fsA, fsB, fsMomentary, fsBypass;

static inline float knob01(int idx)
{
    return hw.controls[idx].Value(); // 0..1 after ProcessAnalogControls()
}

static void AudioCallback(AudioHandle::InputBuffer in,
                          AudioHandle::OutputBuffer out,
                          size_t size)
{
    engine.Process(in[0], out[0], out[1], size); // mono in -> stereo out
}

int main(void)
{
    hw.Init();
    hw.SetAudioBlockSize(64);

    engine.Init(hw.AudioSampleRate());

    // NOTE: These pins are examples; choose pins you actually wire to your momentary switches.
    fsA.Init(hw.B7);         // Scene A
    fsB.Init(hw.B8);         // Scene B
    fsMomentary.Init(hw.B9); // Momentary B while held
    fsBypass.Init(hw.B10);   // Toggle bypass

    hw.StartAudio(AudioCallback);

    while(1)
    {
        hw.ProcessAnalogControls();
        hw.ProcessDigitalControls();

        fsA.Debounce();
        fsB.Debounce();
        fsMomentary.Debounce();
        fsBypass.Debounce();

        cc::Macros m{};
        m.touch  = knob01(0);
        m.heat   = knob01(1);
        m.motion = knob01(2);
        m.depth  = knob01(3);
        m.body   = knob01(3); // TEMP: duplicate until you add a 5th pot

        engine.SetMacros(m);

        if(fsA.RisingEdge()) engine.SetSceneA();
        if(fsB.RisingEdge()) engine.SetSceneB();

        if(fsMomentary.RisingEdge()) engine.SetMomentaryB(true);
        if(fsMomentary.FallingEdge()) engine.SetMomentaryB(false);

        if(fsBypass.RisingEdge()) engine.ToggleBypass();

        System::Delay(1);
    }
}
