import { Composition } from "remotion";
import {
  AntGravityPromo,
  AntGravityPromoExtended,
  AntGravityPromoShorts,
} from "./compositions/AntGravityPromo";
import { AntGravitySiteWalkthroughShort } from "./compositions/AntGravitySiteWalkthroughShort";
import { promoCompositions } from "./content";

export const Root = () => {
  return (
    <>
      {promoCompositions.map((composition) => {
        const component =
          composition.id === "AntGravityPromo"
            ? AntGravityPromo
            : composition.id === "AntGravityPromoShorts"
              ? AntGravityPromoShorts
              : AntGravityPromoExtended;

        return (
          <Composition
            key={composition.id}
            id={composition.id}
            component={component}
            durationInFrames={composition.durationInFrames}
            fps={composition.fps}
            width={composition.width}
            height={composition.height}
          />
        );
      })}
      <Composition
        id="AntGravitySiteWalkthroughShort"
        component={AntGravitySiteWalkthroughShort}
        durationInFrames={540}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="AntGravitySiteWalkthroughShortA"
        component={AntGravitySiteWalkthroughShort}
        durationInFrames={540}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ bgmPath: "audio/site-bgm-A-coin-battle-open.mp3" }}
      />
      <Composition
        id="AntGravitySiteWalkthroughShortB"
        component={AntGravitySiteWalkthroughShort}
        durationInFrames={540}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ bgmPath: "audio/site-bgm-B-brilliant-battle-girl.mp3" }}
      />
      <Composition
        id="AntGravitySiteWalkthroughShortC"
        component={AntGravitySiteWalkthroughShort}
        durationInFrames={540}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ bgmPath: "audio/site-bgm-C-opening-this-coin-app.mp3" }}
      />
      <Composition
        id="AntGravitySiteWalkthroughShortD"
        component={AntGravitySiteWalkthroughShort}
        durationInFrames={540}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ bgmPath: "audio/site-bgm-D-coin-battle-opening.mp3" }}
      />
    </>
  );
};
