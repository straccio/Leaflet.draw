L.Map.mergeOptions({
										 touchExtend: true
									 });

L.Map.TouchExtend = L.Handler.extend(
	{

		initialize: function ( map ) {
			this._map = map;
			this._container = map._container;
			this._pane = map._panes.overlayPane;
		},

		addHooks: function () {
			L.DomEvent.on( this._container, 'touchstart', this._onTouchStart, this );
			L.DomEvent.on( this._container, 'touchend', this._onTouchEnd, this );
			L.DomEvent.on( this._container, 'touchcancel', this._onTouchCancel, this );
			L.DomEvent.on( this._container, 'touchleave', this._onTouchLeave, this );
			L.DomEvent.on( this._container, 'touchmove', this._onTouchMove, this );
		},

		removeHooks: function () {
			L.DomEvent.off( this._container, 'touchstart', this._onTouchStart );
			L.DomEvent.off( this._container, 'touchend', this._onTouchEnd );
			L.DomEvent.off( this._container, 'touchcancel', this._onTouchCancel );
			L.DomEvent.off( this._container, 'touchleave', this._onTouchLeave );
			L.DomEvent.off( this._container, 'touchmove', this._onTouchMove );
		},

		_touchEvent: function ( e,
														type
			) {
			// #TODO: fix the pageX error that is do a bug in Android where a single touch triggers two click events
			// _filterClick is what leaflet uses as a workaround.
			var mouseEvent = type === 'touchend' ? e.changedTouches[0] : e.touches[0],
				containerPoint = this._map.mouseEventToContainerPoint( mouseEvent ),
				layerPoint = this._map.mouseEventToLayerPoint( mouseEvent ),
				latlng = this._map.layerPointToLatLng( layerPoint );

			this._map.fire( type, {
				latlng: latlng,
				layerPoint: layerPoint,
				containerPoint: containerPoint,
				pageX: mouseEvent.pageX,
				pageY: mouseEvent.pageY,
				originalEvent: e
			} );
		},

		_onTouchStart: function ( e ) {
			if ( !this._map._loaded ) {
				return;
			}

			var type = 'touchstart';
			this._touchEvent( e, type );

		},

		_onTouchEnd: function ( e ) {
			if ( !this._map._loaded ) {
				return;
			}

			var type = 'touchend';
			this._touchEvent( e, type );
		},

		_onTouchCancel: function ( e ) {
			if ( !this._map._loaded ) {
				return;
			}

			var type = 'touchcancel';
			this._touchEvent( e, type );
		},

		_onTouchLeave: function ( e ) {
			if ( !this._map._loaded ) {
				return;
			}

			var type = 'touchleave';
			this._touchEvent( e, type );
		},

		_onTouchMove: function ( e ) {
			if ( !this._map._loaded ) {
				return;
			}

			var type = 'touchmove';
			this._touchEvent( e, type );
		}
	} );

L.Map.addInitHook( 'addHandler', 'touchExtend', L.Map.TouchExtend );

// This isn't full Touch support. This is just to get makers to also support dom touch events after creation
// #TODO: find a better way of getting markers to support touch.
L.Marker.Touch = L.Marker.extend(
	{

		// This is an exact copy of https://github.com/Leaflet/Leaflet/blob/v0.7/src/layer/marker/Marker.js
		// with the addition of the touch event son line 15.
//		_initInteraction: function () {
//
//			if ( !this.options.clickable ) {
//				return;
//			}
//
//			// TODO refactor into something shared with Map/Path/etc. to DRY it up
//
//			var icon = this._icon,
//				events = ['dblclick', 'mousedown', 'mouseover', 'mouseout', 'contextmenu',
//									'touchstart', 'touchend', 'touchmove', 'touchcancel'
//				];
//
//			L.DomUtil.addClass( icon, 'leaflet-clickable' );
//			L.DomEvent.on( icon, 'click', this._onMouseClick, this );
//			L.DomEvent.on( icon, 'keypress', this._onKeyPress, this );
//
//			for ( var i = 0; i < events.length; i++ ) {
//				L.DomEvent.on( icon, events[i], this._fireMouseEvent, this );
//			}
//
//			if ( L.Handler.MarkerDrag ) {
//				this.dragging = new L.Handler.MarkerDrag( this );
//
//				if ( this.options.draggable ) {
//					this.dragging.enable();
//				}
//			}
//		}
		_initInteraction: function () {

			if (!this.options.clickable) { return; }

			L.DomUtil.addClass(this._icon, 'leaflet-clickable');



			if( L.Browser.touch){
//				L.DomEvent.on(this._icon,'click',this._fireTouchEvent,this);
				L.DomEvent.on(this._icon,'touchstart',this._fireTouchEvent,this);
				L.DomEvent.on(this._icon,'touchend',this._fireTouchEvent,this);
				L.DomEvent.on(this._icon,'touchmove',this._fireTouchEvent,this);
				L.DomEvent.on(this._icon,'touchcancel',this._fireTouchEvent,this);
			}else{
//				'click dblclick mousedown mouseup mouseover mouseout contextmenu keypress'
				L.DomEvent.on(this._icon, 'click',this._fireMouseEvent, this);
				L.DomEvent.on(this._icon, 'dblclick',this._fireMouseEvent, this);
				L.DomEvent.on(this._icon, 'mousedown',this._fireMouseEvent, this);
				L.DomEvent.on(this._icon, 'mouseup',this._fireMouseEvent, this);
				L.DomEvent.on(this._icon, 'mouseover',this._fireMouseEvent, this);
				L.DomEvent.on(this._icon, 'mouseout',this._fireMouseEvent, this);
				L.DomEvent.on(this._icon, 'contextmenu',this._fireMouseEvent, this);
				L.DomEvent.on(this._icon, 'keypress',this._fireMouseEvent, this);
//				L.DomEvent.on(this._icon, 'click dblclick mousedown mouseup mouseover mouseout contextmenu keypress',
//											this._fireMouseEvent, this);
			}

			if (L.Handler.MarkerDrag) {
				this.dragging = new L.Handler.MarkerDrag(this);

				if (this.options.draggable) {
					this.dragging.enable();
				}
			}
		},
//
		_fireTouchEvent: function (e, type) {
			// to prevent outline when clicking on keyboard-focusable marker
			type= e.type;
			if (e.type === 'touchstart') {
				L.DomEvent.preventDefault(e);
			}

			if (e.type === 'touchstart' && this.dragging && this.dragging.moved()) { return; }

			if (this._map && this._map.touchExtend && this._map.touchExtend.enabled) {
				this._map._fireMouseEvent(this, e, type, true, this._latlng);
//				this._map._fireMouseEvent(e, type);
			}
		}
	} );