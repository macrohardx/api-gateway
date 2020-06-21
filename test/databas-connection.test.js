const { describe, it } = require('mocha')
const chai = require('chai')
const { expect } = chai
const chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)


describe('database-connection', () => {
    
    const { maybeConnectToDatabase } = require('../src/database-connection')
    describe('maybeConnectToDatabase when called', () => {

        const dbStubOk = { connect: () => Promise.resolve(true) }
        const dbStubBad = { connect: () => Promise.reject(new Error('Bad Error')) }
        const dbUrlStub = 'test'
        const dbNameStub = 'test11'
        const dbTimeoutStub = 1

        it('should work with good sbStub', () =>
            expect(maybeConnectToDatabase(dbStubOk, dbUrlStub, dbNameStub, dbTimeoutStub))
                .to.eventually.include({ ok: true })
                .and.have.property('value')
        )

        it('should fail with bad stub', () =>
            expect(maybeConnectToDatabase(dbStubBad, dbUrlStub, dbNameStub, dbTimeoutStub))
                .to.eventually.include({ ok: false})
                .and.have.property('error')
        )
    })
})