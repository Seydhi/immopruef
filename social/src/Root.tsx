import React from 'react'
import { Composition } from 'remotion'
import { FPS, H, W } from './brand'
import { ExposeCheck, EXPOSE_CHECK_FRAMES } from './videos/ExposeCheck'
import { AnalyseDemo, ANALYSE_DEMO_FRAMES } from './videos/AnalyseDemo'
import { NebenkostenLaender, NEBENKOSTEN_FRAMES } from './videos/NebenkostenLaender'

export const Root: React.FC = () => (
  <>
    <Composition id="ExposeCheck" component={ExposeCheck} durationInFrames={EXPOSE_CHECK_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="AnalyseDemo" component={AnalyseDemo} durationInFrames={ANALYSE_DEMO_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="NebenkostenLaender" component={NebenkostenLaender} durationInFrames={NEBENKOSTEN_FRAMES} fps={FPS} width={W} height={H} />
  </>
)
