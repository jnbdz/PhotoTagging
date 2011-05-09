/*
---
description: With this plugin you can tag people and/or objects in pictures.

authors:
  - Jean-Nicolas Boulay Desjardins (http://jean-nicolas.name)

license:
  - MIT-style license

requires:
 - core/1.3:   '*'

provides:
  - PhotoTagging
...
*/

var PhotoTagging = new Class({

	Implements: [Events, Options],

	options: {
		tagLimit: 50,
		taggerSize: 150,
		eventToAddTag: 'click',
		canTag: true
	},

	initialize: function(img, options) {

		this.img = document.id(img);
		this.setOptions(options);

		this.reset();
		this.attach();

	},

	reset: function(){

		this.imgWidth = this.img.getStyle('width').toFloat();
                this.imgHeight = this.img.getStyle('height').toFloat();
                this.centerOfTaggingBox = (this.options.taggerSize/2);
		this.canTag = this.options.canTag;

		this.fireEvent('reset');

	},

	attach: function(){

		this.taggerControl = new Element('div', {
			'class': 'phototagging-taggercontrol',
			'styles': {
				position: 'absolute',
				border: '#000 solid 1px',
				backgroundColor: '#fff',
				cursor: 'default',
				padding: 10,
				marginLeft: 160
			}
		}).adopt(new Element('form', {
			'action': '#',
			'method': 'get'
		}).adopt(new Element('span', {
			'text': 'Type any name or tag:'
		}), this.taggerInputName = new Element('input', {
			'type': 'text',
			'name': 'phototagging-tagger-input-name'
		}), new Element('button', {
			'text': 'Tag',
			'events': {
				'click': function(ev){

					this.addTag(this.taggerInputName);

				}.bind(this)
			}
		}), new Element('button', {
			'text': 'Cancel',
			'events': {
				'click': function(){

					this.removeTagger();

					this.fireEvent('cancel');

				}.bind(this)
			}
		})));

		this.tagger = new Element('div', {
			'class': 'phototagging-tagger',
                        'styles': {
                                'display': 'none',
                                position: 'absolute',
                                border: '#000 solid 1px',
				'width': this.options.taggerSize,
				'height': this.options.taggerSize
                        }
                }).adopt(this.taggerControl);

		this.wrapper = new Element('div', {
                        'class': 'phototagging-wrapper',
                        'styles': {
                                'width': this.imgWidth,
                                'height': this.imgHeight,
				'cursor': 'crosshair'
                        }
                }).wrap(this.img.addEvent(this.options.eventToAddTag, function(e){
			this.tag(e.page);
		})).adopt(this.tagger, this.resizingHandle = new Element('div', {
			'class': 'phototagging-resizing-handle',
			'styles': {
				position: 'absolute',
				backgroundColor:'#fff',
				width: 10,
				height: 10,
				top: 140,
				left: 140,
				cursor: 'se-resize'
			}
		}),
			this.innerTagger = new Element('div', {
				'styles': {
					border: '#ccc solid 10px',
					cursor: 'move',
					width: 130,
					height: 130
				}
			}));

		new Drag.Move(this.tagger, {
			container: this.wrapper,
			handle: this.innerTagger
		}.bind(this));

		this.tagger.makeResizable({
			container: this.wrapper,
			handle: this.resizingHandle,
			limit: {
				x: [50, ImageWidth],
				y: [50, ImageHeight]
			},
			onDrag: function(value){
				var CoorTagEdit = this.wrapper.getCoordinates();
				var CoorTaggingBox = this.tagger.getCoordinates();
				var TopOfTaggingBox = (CoorTagEdit.top > CoorTaggingBox.top) ? (CoorTagEdit.top - CoorTaggingBox.top) : (CoorTaggingBox.top - CoorTagEdit.top);
				var LeftOfTaggingBox = (CoorTagEdit.left > CoorTaggingBox.left) ? (CoorTagEdit.left - CoorTaggingBox.left) : (CoorTaggingBox.left - CoorTagEdit.left);

				this.limit.x[1] = (ImageWidth - LeftOfTaggingBox);
				this.limit.y[1] = (ImageHeight - TopOfTaggingBox);

				this.innerTagging.setStyles({
					width: (value.getStyle('width').toFloat() - 20),
					height: (value.getStyle('height').toFloat() - 20)
				});

				TaggingBoxHandle.setStyles({
					top: (value.getStyle('height').toFloat() - 10),
					left: (value.getStyle('width').toFloat() - 10)
				});

				TaggingOpt.setStyles({
					marginLeft: (value.getStyle('width').toFloat() + 10)
				});

			}
		}.bind(this));

		this.fireEvent('attach', [this.wrapper, this.tagger, this.taggerControl]);

	},

	detach: function(){

		this.wrapper.destroy();

		this.fireEvent('detach');

	},

	setTagging: function(){

		this.canTag = true;

	},

	unsetTagging: function(){

		this.canTag = false;

	},

	tag: function(coor){

		if(!this.canTag) return;

		this.canTag = false;

		this.coorOfImg = this.img.getCoordinates();
		this.coorLimit = {
			x: ((this.imageWidth + this.coorOfImg.left) - this.centerOfTaggingBox),
			y: ((this.imageHeight + this.coorOfImg.top) - this.centerOfTaggingBox)
		};

		this.taggerPositionTop = (this.coorLimit.y < coor.y) ? (this.coorLimit.y - this.centerOfTaggingBox) : (((coor.y - this.centerOfTaggingBox) < 0 ) ? (0 + this.coorOfImg.top) : (coor.y - this.centerOfTaggingBox));
		this.taggerPositionLeft = (this.coorLimit.x < coor.x) ? (this.coorLimit.x - this.centerOfTaggingBox) : (((coor.x - this.centerOfTaggingBox) < 0 ) ? (0 + this.coorOfImg.left) : (coor.x - this.centerOfTaggingBox));

		this.tagger.setStyles({
			'top': this.taggerPositionTop,
			'left': this.taggerPositionLeft
		});

		this.fireEvent('tagging', [this.tagger]);

	},

	removeTagger: function(){

		this.tagger.destroy();

		this.canTag = this.options.canTag;

		this.fireEvent('removedTagger', [tagger]);

	},

	addTag: function(name){

		//var tagMarginTop = this.img.getStyle('top') - ;
		//var tagMarginLeft = (this.img.getStyle('bottom'));

		var tag = new Element('div', {
			'class': 'tag',
			'styles': this.tagger.getStyles('position', 'width', 'height', 'top', 'left')
		});

		this.fireEvent('addedTag', [tag, name]);

	},

	removeTag: function(tag){

		var tag = document.id(tag);
		var oldTag = tag;

		tag.destroy();

		this.fireEvent('removedTag', [oldTag]);

	}

});
