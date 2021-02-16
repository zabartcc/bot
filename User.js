import m from 'mongoose';
import mlv from 'mongoose-lean-virtuals';
import zab from './config.js';
import './Role.js';

const userSchema = new m.Schema({
	cid: Number,
	fname: String,
	lname: String,
	email: String,
	rating: Number,
	oi: String,
	broadcast: Boolean,
	member: Boolean,
	vis: Boolean,
	discordInfo: {
		clientId: String,
		accessToken: String,
		refreshToken: String,
		tokenType: String,
		expires: Date,
	},
	certifications: [{
		type: m.Schema.Types.ObjectId, ref: 'Certification'
	}],
	roles: [{
		type: m.Schema.Types.ObjectId, ref: 'Role'
	}],
	trainingMilestones: [{
		type: m.Schema.Types.ObjectId, ref: 'TrainingMilestone'
	}]
}, {
	timestamps: true,
});

userSchema.plugin(mlv);

userSchema.virtual('isMem').get(function() {
	return !!this.member;
});

userSchema.virtual('isStaff').get(function() {
	const search = ['atm', 'datm', 'ta', 'ec', 'wm', 'fe'];
	return this.roles ? !!this.roles.filter(r => search.includes(r.code)).length : false;
});

userSchema.virtual('isIns').get(function() {
	const search = ['atm', 'datm', 'ta', 'ins', 'mtr'];
	return this.roles ? !!this.roles.filter(r => search.includes(r.code)).length : false;
});

userSchema.virtual('isMgt').get(function() {
	const search = ['atm', 'datm', 'ta'];
	return this.roles ? !!this.roles.filter(r => search.includes(r.code)).length : false;
});

userSchema.virtual('ratingShort').get(function() {
	return zab.ratings[this.rating];
});

userSchema.virtual('ratingLong').get(function() {
	return zab.ratingsLong[this.rating];
});

export default m.model('User', userSchema);