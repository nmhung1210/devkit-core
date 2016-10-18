/**
 * @license
 * This file is part of the Game Closure SDK.
 *
 * The Game Closure SDK is free software: you can redistribute it and/or modify
 * it under the terms of the Mozilla Public License v. 2.0 as published by Mozilla.

 * The Game Closure SDK is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Mozilla Public License v. 2.0 for more details.

 * You should have received a copy of the Mozilla Public License v. 2.0
 * along with the Game Closure SDK.  If not, see <http://mozilla.org/MPL/2.0/>.
 */
jsio('import device');
jsio('import lib.PubSub as PubSub');

var hasNativeViews = GLOBAL.NATIVE && NATIVE.timestep && NATIVE.timestep.View;

var VIEW_TYPES = {
  DEFAULT: 0,
  IMAGE_VIEW: 1
};

jsio('import .timestep.NativeView');
jsio('import ui.View as View');
jsio('import .timestep.NativeViewBacking');
jsio('import .timestep.NativeImageView');
jsio('import ui.ImageView as ImageView');

function installNativeView() {
  // extend the timestep View class
  timestep.NativeView.install();

  View.setDefaultViewBacking(NATIVE.timestep.View);

  // extend the timestep ViewBacking class
  timestep.NativeViewBacking.install();

  timestep.NativeImageView.install();

  var animate = device.importUI('animate');
  var ViewAnimator = animate.getViewAnimator();
  // use accelerated native view animators
  animate.setViewAnimator(NATIVE.timestep.Animator);
  // native view animators inherit from PubSub (Emitter) to match JS
  merge(NATIVE.timestep.Animator.prototype, PubSub.prototype);
  // native view animators need to add themselves to animate groups in JS
  NATIVE.timestep.Animator.prototype._addToGroup = ViewAnimator.prototype._addToGroup;
  // native view animators need to remove themselves from animate groups in JS
  NATIVE.timestep.Animator.prototype._removeFromGroup = ViewAnimator.prototype._removeFromGroup;

  // add some properties to View and ImageView to defer to native rendering
  View.prototype.__type = VIEW_TYPES.DEFAULT;

  ImageView.prototype.__type = VIEW_TYPES.IMAGE_VIEW;
  ImageView.prototype.render.HAS_NATIVE_IMPL = true;

  logger.log('USING NATIVE VIEWS');
}


logger.log(typeof GLOBAL.CONFIG, GLOBAL.CONFIG && CONFIG.disableNativeViews);

if (GLOBAL.CONFIG && CONFIG.disableNativeViews || !hasNativeViews) {
  logger.log('USING JS VIEWS');
  exports.install = function () {
  };
} else {
  exports.install = installNativeView;
}
