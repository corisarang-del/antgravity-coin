import { Composition } from "remotion";
import {
  AntGravityPromo,
  AntGravityPromoExtended,
  AntGravityPromoShorts,
} from "./compositions/AntGravityPromo";
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
    </>
  );
};
