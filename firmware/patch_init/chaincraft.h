#pragma once
#include "daisysp.h"

namespace cc {

// -------- utilities --------
inline float clampf(float x, float a, float b) { return x < a ? a : (x > b ? b : x); }
inline float lerpf(float a, float b, float t)  { return a + (b - a) * t; }
inline float smoothstep(float t) { t = clampf(t, 0.f, 1.f); return t * t * (3.f - 2.f * t); }
inline float db_to_lin(float db) { return powf(10.f, db / 20.f); }

struct OnePole
{
    float y = 0.f;
    float a = 0.02f;
    void SetTimeMs(float ms, float sr)
    {
        const float tau = (ms <= 0.1f) ? 0.0001f : (ms / 1000.f);
        a = 1.f - expf(-1.f / (tau * sr));
    }
    float Process(float x)
    {
        y += a * (x - y);
        return y;
    }
};

// -------- macros --------
struct Macros
{
    float touch  = 0.f;
    float heat   = 0.f;
    float motion = 0.f;
    float depth  = 0.f;
    float body   = 0.f;
};

// -------- minimal rig params (v1) --------
struct DynP { bool enable=true; float thresh_db=-22, ratio=2.5f, attack_ms=18, release_ms=220, makeup_db=4, mix=0.55f; };
struct DrvP { int type=1; float pre_gain_db=9, asym=0.25f, tone_tilt=-0.15f, low_cut_hz=90, high_cut_hz=8500, mix=0.65f, level_db=0; };
struct ChrP { int mode=1; float rate_hz=0.45f, depth=0.25f, mix=0.30f, tone=-0.10f; };
struct StpP { float width=0.55f, micro_delay_ms=6.5f; };
struct SpcP { float damp=0.45f, wet=0.38f, dry=1.0f; float decay_s=3.2f; };
struct CabP { float low_res_hz=110.f, high_roll_hz=6800.f, air=0.30f; };
struct OutP { float level_db=-3.f, lim_thresh_db=-6.f, lim_release_ms=160.f; };

struct RigP
{
    DynP dyn;
    DrvP drv;
    ChrP chr;
    StpP stp;
    SpcP spc;
    CabP cab;
    OutP out;
};

// -------- blocks --------
struct DynamicsBlock
{
    daisysp::Compressor comp;
    void Init(float sr)
    {
        comp.Init(sr);
        comp.SetRatio(2.f);
        comp.SetThreshold(-18.f);
        comp.SetAttack(0.02f);
        comp.SetRelease(0.2f);
    }
    float Process(float x, const DynP& p)
    {
        if(!p.enable) return x;
        comp.SetThreshold(p.thresh_db);
        comp.SetRatio(p.ratio);
        comp.SetAttack(p.attack_ms / 1000.f);
        comp.SetRelease(p.release_ms / 1000.f);
        float y = comp.Process(x) * db_to_lin(p.makeup_db);
        return lerpf(x, y, clampf(p.mix, 0.f, 1.f));
    }
};

struct DriveBlock
{
    daisysp::Svf hp, lp;
    void Init(float sr)
    {
        hp.Init(sr); lp.Init(sr);
        hp.SetRes(0.2f); lp.SetRes(0.2f);
    }
    static float SoftClip(float x) { return tanhf(x); }
    static float HardClip(float x) { return clampf(x, -1.f, 1.f); }
    static float Fold(float x)
    {
        float y = x;
        if(y > 1.f)  y = 2.f - y;
        if(y < -1.f) y = -2.f - y;
        return y;
    }
    float Process(float x, const DrvP& p)
    {
        hp.SetFreq(p.low_cut_hz);
        lp.SetFreq(p.high_cut_hz);
        hp.Process(x);
        float y = hp.High();
        lp.Process(y);
        y = lp.Low();

        y *= db_to_lin(p.pre_gain_db);
        y += p.asym * 0.15f * (y * y * y);

        float s = y;
        switch(p.type)
        {
            case 0: break;
            case 1: s = SoftClip(y); break;
            case 2: s = HardClip(y); break;
            case 3: s = SoftClip(y * 1.2f); s = clampf(s + 0.1f * y, -1.2f, 1.2f); break;
            case 4: s = Fold(y); break;
            case 5: s = SoftClip(Fold(y * 1.3f)); break;
            default: s = SoftClip(y); break;
        }

        s = s * (1.f - 0.15f * p.tone_tilt);
        float out = lerpf(x, s, clampf(p.mix, 0.f, 1.f));
        out *= db_to_lin(p.level_db);
        return out;
    }
};

struct CharacterBlock
{
    daisysp::Chorus chorus;
    daisysp::Tremolo trem;
    void Init(float sr)
    {
        chorus.Init(sr);
        trem.Init(sr);
        trem.SetWaveform(daisysp::Tremolo::WAVE_SIN);
    }
    float Process(float x, const ChrP& p)
    {
        if(p.mode == 0) return x;
        if(p.mode == 3)
        {
            trem.SetFreq(p.rate_hz);
            trem.SetDepth(p.depth);
            float t = trem.Process(x);
            return lerpf(x, t, p.mix);
        }
        chorus.SetRate(p.rate_hz);
        chorus.SetDepth(p.depth);
        chorus.SetFeedback(0.1f);
        float c = chorus.Process(x);
        return lerpf(x, c, p.mix);
    }
};

struct StereoSplitBlock
{
    float sr = 48000.f;
    daisysp::DelayLine<float, 960> dl;
    daisysp::DelayLine<float, 960> dr;

    void Init(float sample_rate)
    {
        sr = sample_rate;
        dl.Init();
        dr.Init();
    }

    void Process(float x, const StpP& p, float& L, float& R)
    {
        const float w = clampf(p.width, 0.f, 1.f);
        const float d_ms = clampf(p.micro_delay_ms, 0.f, 12.f);
        const float d_samp = (d_ms / 1000.f) * sr;

        dl.SetDelay(d_samp);
        dr.SetDelay(d_samp * 0.85f);

        dl.Write(x);
        dr.Write(x);

        float l = dl.Read();
        float r = dr.Read();

        L = lerpf(x, l, w);
        R = lerpf(x, r, w);
    }
};

struct SpaceBlock
{
    daisysp::ReverbSc verb;
    void Init(float sr)
    {
        verb.Init(sr);
        verb.SetFeedback(0.85f);
        verb.SetLpFreq(8000.f);
    }
    void Process(float inL, float inR, const SpcP& p, float& oL, float& oR)
    {
        float fb = clampf(0.55f + (p.decay_s / 12.f) * 0.40f, 0.55f, 0.95f);
        verb.SetFeedback(fb);
        float lp = lerpf(12000.f, 2000.f, clampf(p.damp, 0.f, 1.f));
        verb.SetLpFreq(lp);

        float vL, vR;
        verb.Process(inL, inR, &vL, &vR);

        const float wet = clampf(p.wet, 0.f, 1.f);
        const float dry = clampf(p.dry, 0.f, 1.f);
        oL = dry * inL + wet * vL;
        oR = dry * inR + wet * vR;
    }
};

struct CabOutBlock
{
    daisysp::Svf low, high;
    daisysp::Limiter limL, limR;

    void Init(float sr)
    {
        low.Init(sr); high.Init(sr);
        low.SetRes(0.7f);
        high.SetRes(0.4f);
        limL.Init(sr);
        limR.Init(sr);
    }

    void Process(float inL, float inR, const CabP& cab, const OutP& out, float& oL, float& oR)
    {
        low.SetFreq(cab.low_res_hz);
        high.SetFreq(cab.high_roll_hz);

        low.Process(inL);  float l1 = low.Low();
        high.Process(l1);  float l2 = high.Low();

        low.Process(inR);  float r1 = low.Low();
        high.Process(r1);  float r2 = high.Low();

        float air = clampf(cab.air, 0.f, 1.f);
        l2 = l2 + air * 0.05f * (inL - l2);
        r2 = r2 + air * 0.05f * (inR - r2);

        float g = db_to_lin(out.level_db);
        l2 *= g; r2 *= g;

        limL.SetThreshold(db_to_lin(out.lim_thresh_db));
        limR.SetThreshold(db_to_lin(out.lim_thresh_db));
        limL.SetRelease(out.lim_release_ms / 1000.f);
        limR.SetRelease(out.lim_release_ms / 1000.f);

        oL = limL.Process(l2);
        oR = limR.Process(r2);
    }
};

// -------- engine --------
class ChaincraftEngine
{
public:
    void Init(float sr)
    {
        sr_ = sr;

        sm_touch_.SetTimeMs(10.f, sr_);
        sm_heat_.SetTimeMs(10.f, sr_);
        sm_motion_.SetTimeMs(10.f, sr_);
        sm_depth_.SetTimeMs(10.f, sr_);
        sm_body_.SetTimeMs(10.f, sr_);

        dyn_.Init(sr_);
        drv_.Init(sr_);
        chr_.Init(sr_);
        stp_.Init(sr_);
        spc_.Init(sr_);
        cab_.Init(sr_);

        A_ = RigP{};
        B_ = RigP{};
        // Scene B blooms
        B_.drv.type = 3; B_.drv.pre_gain_db = 14.f;
        B_.spc.decay_s = 6.8f; B_.spc.wet = 0.52f;
        B_.stp.width = 0.75f; B_.stp.micro_delay_ms = 9.0f;
        B_.out.level_db = -2.f;

        morph_ = 0.f; morph_target_ = 0.f; morph_ms_ = 120.f;
        bypass_ = false;
    }

    void SetMacros(const Macros& m) { macros_ = m; }

    void SetSceneA() { morph_target_ = 0.f; morph_ms_ = 120.f; }
    void SetSceneB() { morph_target_ = 1.f; morph_ms_ = 120.f; }

    void SetMomentaryB(bool down)
    {
        morph_ms_ = down ? 80.f : 120.f;
        morph_target_ = down ? 1.f : 0.f;
    }

    void ToggleBypass() { bypass_ = !bypass_; }

    void Process(const float* inMono, float* outL, float* outR, size_t n)
    {
        StepMorph(n);
        const float shaped = smoothstep(morph_);

        Macros m;
        m.touch  = clampf(sm_touch_.Process(macros_.touch), 0.f, 1.f);
        m.heat   = clampf(sm_heat_.Process(macros_.heat), 0.f, 1.f);
        m.motion = clampf(sm_motion_.Process(macros_.motion), 0.f, 1.f);
        m.depth  = clampf(sm_depth_.Process(macros_.depth), 0.f, 1.f);
        m.body   = clampf(sm_body_.Process(macros_.body), 0.f, 1.f);

        RigP p = LerpRig(A_, B_, shaped);
        ApplyMacroMaps(p, m);

        for(size_t i = 0; i < n; i++)
        {
            float x = inMono[i];

            if(bypass_)
            {
                outL[i] = x;
                outR[i] = x;
                continue;
            }

            float y = x;
            y = dyn_.Process(y, p.dyn);
            y = drv_.Process(y, p.drv);
            y = chr_.Process(y, p.chr);

            float L, R;
            stp_.Process(y, p.stp, L, R);

            float sL, sR;
            spc_.Process(L, R, p.spc, sL, sR);

            float oL, oR;
            cab_.Process(sL, sR, p.cab, p.out, oL, oR);

            outL[i] = oL;
            outR[i] = oR;
        }
    }

private:
    float sr_ = 48000.f;

    RigP A_, B_;

    float morph_ = 0.f;
    float morph_target_ = 0.f;
    float morph_ms_ = 120.f;

    bool bypass_ = false;

    Macros macros_{};
    OnePole sm_touch_, sm_heat_, sm_motion_, sm_depth_, sm_body_;

    DynamicsBlock dyn_;
    DriveBlock drv_;
    CharacterBlock chr_;
    StereoSplitBlock stp_;
    SpaceBlock spc_;
    CabOutBlock cab_;

    void StepMorph(size_t blockSize)
    {
        const float dt_ms = (1000.f * (float)blockSize) / sr_;
        const float step = dt_ms / (morph_ms_ <= 1.f ? 1.f : morph_ms_);

        if(fabsf(morph_target_ - morph_) < 0.0005f) { morph_ = morph_target_; return; }

        if(morph_target_ > morph_) morph_ = clampf(morph_ + step, 0.f, 1.f);
        else                       morph_ = clampf(morph_ - step, 0.f, 1.f);
    }

    static RigP LerpRig(const RigP& A, const RigP& B, float t)
    {
        RigP p = A;

        p.dyn.thresh_db  = lerpf(A.dyn.thresh_db,  B.dyn.thresh_db,  t);
        p.dyn.ratio      = lerpf(A.dyn.ratio,      B.dyn.ratio,      t);
        p.dyn.attack_ms  = lerpf(A.dyn.attack_ms,  B.dyn.attack_ms,  t);
        p.dyn.release_ms = lerpf(A.dyn.release_ms, B.dyn.release_ms, t);
        p.dyn.makeup_db  = lerpf(A.dyn.makeup_db,  B.dyn.makeup_db,  t);
        p.dyn.mix        = lerpf(A.dyn.mix,        B.dyn.mix,        t);

        p.drv.type       = (t < 0.5f) ? A.drv.type : B.drv.type;
        p.drv.pre_gain_db= lerpf(A.drv.pre_gain_db,B.drv.pre_gain_db,t);
        p.drv.asym       = lerpf(A.drv.asym,       B.drv.asym,       t);
        p.drv.tone_tilt  = lerpf(A.drv.tone_tilt,  B.drv.tone_tilt,  t);
        p.drv.low_cut_hz = lerpf(A.drv.low_cut_hz, B.drv.low_cut_hz, t);
        p.drv.high_cut_hz= lerpf(A.drv.high_cut_hz,B.drv.high_cut_hz,t);
        p.drv.mix        = lerpf(A.drv.mix,        B.drv.mix,        t);
        p.drv.level_db   = lerpf(A.drv.level_db,   B.drv.level_db,   t);

        p.chr.mode       = (t < 0.5f) ? A.chr.mode : B.chr.mode;
        p.chr.rate_hz    = lerpf(A.chr.rate_hz,    B.chr.rate_hz,    t);
        p.chr.depth      = lerpf(A.chr.depth,      B.chr.depth,      t);
        p.chr.mix        = lerpf(A.chr.mix,        B.chr.mix,        t);
        p.chr.tone       = lerpf(A.chr.tone,       B.chr.tone,       t);

        p.stp.width          = lerpf(A.stp.width,          B.stp.width,          t);
        p.stp.micro_delay_ms = lerpf(A.stp.micro_delay_ms, B.stp.micro_delay_ms, t);

        p.spc.decay_s = lerpf(A.spc.decay_s, B.spc.decay_s, t);
        p.spc.damp    = lerpf(A.spc.damp,    B.spc.damp,    t);
        p.spc.wet     = lerpf(A.spc.wet,     B.spc.wet,     t);
        p.spc.dry     = lerpf(A.spc.dry,     B.spc.dry,     t);

        p.cab.low_res_hz   = lerpf(A.cab.low_res_hz,  B.cab.low_res_hz,  t);
        p.cab.high_roll_hz = lerpf(A.cab.high_roll_hz,B.cab.high_roll_hz,t);
        p.cab.air          = lerpf(A.cab.air,         B.cab.air,         t);

        p.out.level_db      = lerpf(A.out.level_db,      B.out.level_db,      t);
        p.out.lim_thresh_db = lerpf(A.out.lim_thresh_db, B.out.lim_thresh_db, t);
        p.out.lim_release_ms= lerpf(A.out.lim_release_ms,B.out.lim_release_ms,t);

        return p;
    }

    static void ApplyMacroMaps(RigP& p, const Macros& m)
    {
        float t = m.touch;
        p.dyn.thresh_db  += (-6.f * t);
        p.dyn.ratio      += (1.5f * (t * t));
        p.dyn.attack_ms  += (6.f * t);
        p.dyn.release_ms += (60.f * t);
        p.dyn.makeup_db  += (3.f * t);
        p.dyn.mix        += (0.20f * t);

        float h = m.heat, h2 = h*h, h3 = h2*h;
        p.drv.pre_gain_db += (18.f * h);
        p.drv.asym        += (0.25f * (h - 0.5f));
        p.drv.tone_tilt   += (-0.25f * h2);
        p.drv.low_cut_hz  += (40.f * h2);
        p.drv.high_cut_hz += (-2000.f * h3);
        p.drv.mix         += (0.10f * h);
        p.drv.level_db    += (-3.f * h);

        float mo = m.motion;
        p.chr.depth   += (0.45f * mo);
        p.chr.mix     += (0.35f * mo);
        p.chr.rate_hz += (0.15f * mo);
        p.chr.tone    += (-0.20f * mo);

        float d = m.depth, d2 = d*d;
        p.spc.wet     += (0.55f * d);
        p.spc.decay_s += (3.5f * d2);
        p.spc.damp    += (-0.20f * d);

        float b = m.body, b2 = b*b;
        p.cab.low_res_hz   += (-20.f * b);
        p.cab.high_roll_hz += (-1400.f * b2);
        p.cab.air          += (0.35f * b);
        p.out.level_db     += (-1.5f * b);

        // light clamping for iteration safety
        p.dyn.thresh_db = clampf(p.dyn.thresh_db, -40.f, 0.f);
        p.dyn.ratio     = clampf(p.dyn.ratio, 1.f, 8.f);
        p.dyn.attack_ms = clampf(p.dyn.attack_ms, 1.f, 80.f);
        p.dyn.release_ms= clampf(p.dyn.release_ms, 20.f, 600.f);
        p.dyn.makeup_db = clampf(p.dyn.makeup_db, 0.f, 18.f);
        p.dyn.mix       = clampf(p.dyn.mix, 0.f, 1.f);

        p.drv.pre_gain_db = clampf(p.drv.pre_gain_db, 0.f, 36.f);
        p.drv.low_cut_hz  = clampf(p.drv.low_cut_hz, 20.f, 300.f);
        p.drv.high_cut_hz = clampf(p.drv.high_cut_hz, 2000.f, 18000.f);
        p.drv.mix         = clampf(p.drv.mix, 0.f, 1.f);
        p.drv.level_db    = clampf(p.drv.level_db, -18.f, 18.f);

        p.chr.rate_hz = clampf(p.chr.rate_hz, 0.05f, 8.f);
        p.chr.depth   = clampf(p.chr.depth, 0.f, 1.f);
        p.chr.mix     = clampf(p.chr.mix, 0.f, 1.f);

        p.stp.width = clampf(p.stp.width, 0.f, 1.f);
        p.stp.micro_delay_ms = clampf(p.stp.micro_delay_ms, 0.f, 12.f);

        p.spc.decay_s = clampf(p.spc.decay_s, 0.2f, 12.f);
        p.spc.damp    = clampf(p.spc.damp, 0.f, 1.f);
        p.spc.wet     = clampf(p.spc.wet, 0.f, 1.f);

        p.cab.low_res_hz   = clampf(p.cab.low_res_hz, 60.f, 180.f);
        p.cab.high_roll_hz = clampf(p.cab.high_roll_hz, 2500.f, 12000.f);
        p.cab.air          = clampf(p.cab.air, 0.f, 1.f);

        p.out.level_db      = clampf(p.out.level_db, -60.f, 6.f);
        p.out.lim_thresh_db = clampf(p.out.lim_thresh_db, -18.f, 0.f);
        p.out.lim_release_ms= clampf(p.out.lim_release_ms, 20.f, 400.f);
    }
};

} // namespace cc
